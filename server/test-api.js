const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the server directory
dotenv.config({ path: path.join(__dirname, './.env') });

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== STARTING INTEGRATION TESTS ===');
  console.log('API URL:', API_URL);
  
  let token = '';
  let userId = '';
  let userEmail = `test_${Date.now()}@example.com`;
  let placeId = '';
  let reviewId = '';

  const headers = () => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  });

  // Helper request function
  async function request(method, path, body = null) {
    const options = {
      method,
      headers: headers(),
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`${API_URL}${path}`, options);
    const data = await response.json();
    return { status: response.status, data };
  }

  try {
    // 1. Sign up user
    console.log('\n1. Testing User Sign Up...');
    const signupRes = await request('POST', '/auth/signup', {
      name: 'Test Integration User',
      email: userEmail,
      password: 'password123'
    });
    if (signupRes.status === 201) {
      console.log('✓ Sign Up Succeeded. User ID:', signupRes.data._id);
      userId = signupRes.data._id;
      token = signupRes.data.token;
    } else {
      throw new Error(`Sign Up Failed (Status ${signupRes.status}): ${JSON.stringify(signupRes.data)}`);
    }

    // 2. Login user
    console.log('\n2. Testing User Login...');
    const loginRes = await request('POST', '/auth/login', {
      email: userEmail,
      password: 'password123'
    });
    if (loginRes.status === 200) {
      console.log('✓ Login Succeeded.');
      token = loginRes.data.token;
    } else {
      throw new Error(`Login Failed (Status ${loginRes.status}): ${JSON.stringify(loginRes.data)}`);
    }

    // 3. Get Me
    console.log('\n3. Testing Get User Profile...');
    const meRes = await request('GET', '/auth/me');
    if (meRes.status === 200 && meRes.data.email === userEmail) {
      console.log('✓ Get Profile Succeeded. Role:', meRes.data.role);
    } else {
      throw new Error(`Get Profile Failed (Status ${meRes.status}): ${JSON.stringify(meRes.data)}`);
    }

    // 4. Try creating a place (should fail - not admin)
    console.log('\n4. Testing Place Creation (Unauthorized)...');
    const failPlaceRes = await request('POST', '/places', {
      name: 'Unauthorized Paradise',
      country: 'Testland',
      city: 'Testville',
      description: 'A place that should not be created.',
      category: 'nature'
    });
    if (failPlaceRes.status === 403) {
      console.log('✓ Blocked Unauthorized User Successfully.');
    } else {
      throw new Error(`Authorization Bypass! Creation returned status ${failPlaceRes.status}: ${JSON.stringify(failPlaceRes.data)}`);
    }

    // 5. Elevate user to Admin directly in MongoDB
    console.log('\n5. Elevating user to admin via DB connection...');
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set in environment.');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');
    
    // We import the User model dynamically
    const User = require('./models/User');
    const updateResult = await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true });
    console.log('✓ User role updated in DB:', updateResult.role);

    // Re-login to get updated token/claims if necessary, or just verify /auth/me returns admin
    console.log('Re-checking user profile...');
    const adminMeRes = await request('GET', '/auth/me');
    if (adminMeRes.status === 200 && adminMeRes.data.role === 'admin') {
      console.log('✓ User is now recognized as admin.');
    } else {
      console.log('Warning: Role update not reflected instantly on /auth/me, trying to re-login...');
      const reLoginRes = await request('POST', '/auth/login', {
        email: userEmail,
        password: 'password123'
      });
      token = reLoginRes.data.token;
      console.log('Re-logged in. New role:', reLoginRes.data.role);
    }

    // 6. Create a place as Admin
    console.log('\n6. Testing Place Creation (Admin)...');
    const placeRes = await request('POST', '/places', {
      name: 'Integration Test Oasis',
      country: 'Testland',
      city: 'Testville',
      description: 'A beautiful oasis created by the integration test suite.',
      category: 'nature',
      images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e']
    });
    if (placeRes.status === 201) {
      console.log('✓ Place Created. ID:', placeRes.data._id);
      placeId = placeRes.data._id;
    } else {
      throw new Error(`Place Creation Failed (Status ${placeRes.status}): ${JSON.stringify(placeRes.data)}`);
    }

    // 7. Update Place details
    console.log('\n7. Testing Place Update...');
    const updatePlaceRes = await request('PUT', `/places/${placeId}`, {
      description: 'An updated beautiful oasis created by the integration test suite.'
    });
    if (updatePlaceRes.status === 200) {
      console.log('✓ Place Updated Successfully.');
    } else {
      throw new Error(`Place Update Failed (Status ${updatePlaceRes.status}): ${JSON.stringify(updatePlaceRes.data)}`);
    }

    // 8. Add Favorite
    console.log('\n8. Testing Adding Favorite...');
    const favRes = await request('POST', `/favorites/${placeId}`);
    if (favRes.status === 201) {
      console.log('✓ Favorite Added.');
    } else {
      throw new Error(`Add Favorite Failed (Status ${favRes.status}): ${JSON.stringify(favRes.data)}`);
    }

    // 9. Get Favorites list
    console.log('\n9. Testing Get Favorites...');
    const getFavsRes = await request('GET', '/favorites');
    if (getFavsRes.status === 200 && getFavsRes.data.some(p => p._id === placeId)) {
      console.log('✓ Favorite Verified in list.');
    } else {
      throw new Error(`Get Favorites Failed or place not in list (Status ${getFavsRes.status}): ${JSON.stringify(getFavsRes.data)}`);
    }

    // 10. Add Review
    console.log('\n10. Testing Creating Review...');
    const reviewRes = await request('POST', `/reviews/place/${placeId}`, {
      rating: 4.5,
      comment: 'Excellent spot, very quiet and clean!'
    });
    if (reviewRes.status === 201) {
      console.log('✓ Review Created. ID:', reviewRes.data._id);
      reviewId = reviewRes.data._id;
    } else {
      throw new Error(`Review Creation Failed (Status ${reviewRes.status}): ${JSON.stringify(reviewRes.data)}`);
    }

    // 11. Get Reviews for Place
    console.log('\n11. Testing Fetch Reviews for Place...');
    const getReviewsRes = await request('GET', `/reviews/place/${placeId}`);
    if (getReviewsRes.status === 200 && getReviewsRes.data.some(r => r._id === reviewId)) {
      console.log('✓ Review found in place reviews.');
    } else {
      throw new Error(`Fetch Reviews Failed or review not found (Status ${getReviewsRes.status}): ${JSON.stringify(getReviewsRes.data)}`);
    }

    // 12. Update Review
    console.log('\n12. Testing Updating Review...');
    const updateReviewRes = await request('PUT', `/reviews/${reviewId}`, {
      rating: 5,
      comment: 'Actually it is a perfect 5 stars place!'
    });
    if (updateReviewRes.status === 200 && updateReviewRes.data.rating === 5) {
      console.log('✓ Review Updated successfully.');
    } else {
      throw new Error(`Review Update Failed (Status ${updateReviewRes.status}): ${JSON.stringify(updateReviewRes.data)}`);
    }

    // 13. Delete Review
    console.log('\n13. Testing Deleting Review...');
    const deleteReviewRes = await request('DELETE', `/reviews/${reviewId}`);
    if (deleteReviewRes.status === 200) {
      console.log('✓ Review Deleted.');
    } else {
      throw new Error(`Review Deletion Failed (Status ${deleteReviewRes.status}): ${JSON.stringify(deleteReviewRes.data)}`);
    }

    // 14. Remove Favorite
    console.log('\n14. Testing Removing Favorite...');
    const removeFavRes = await request('DELETE', `/favorites/${placeId}`);
    if (removeFavRes.status === 200) {
      console.log('✓ Favorite Removed.');
    } else {
      throw new Error(`Remove Favorite Failed (Status ${removeFavRes.status}): ${JSON.stringify(removeFavRes.data)}`);
    }

    // 15. Delete Place
    console.log('\n15. Testing Place Deletion (Admin)...');
    const deletePlaceRes = await request('DELETE', `/places/${placeId}`);
    if (deletePlaceRes.status === 200) {
      console.log('✓ Place Deleted.');
    } else {
      throw new Error(`Place Deletion Failed (Status ${deletePlaceRes.status}): ${JSON.stringify(deletePlaceRes.data)}`);
    }

    // 16. Clean up User from DB
    console.log('\n16. Cleaning up test user from DB...');
    await User.findByIdAndDelete(userId);
    console.log('✓ Test user removed.');

    console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');

  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error.message);
    // Cleanup if possible
    if (userId) {
      try {
        const User = require('./models/User');
        await User.findByIdAndDelete(userId);
        console.log('Cleaned up user after failure.');
      } catch (err) {
        console.error('Failed to cleanup user:', err.message);
      }
    }
    if (placeId) {
      try {
        const Place = require('./models/Place');
        await Place.findByIdAndDelete(placeId);
        console.log('Cleaned up place after failure.');
      } catch (err) {
        console.error('Failed to cleanup place:', err.message);
      }
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runTests();
