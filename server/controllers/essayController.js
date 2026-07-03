const Place = require('../models/Place');

const generateEssay = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });

    // Return cached essay if exists
    if (place.historicalEssay) {
      return res.json({ essay: place.historicalEssay, cached: true });
    }

    // Generate new essay via Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Write a detailed travel magazine essay about ${place.name} in ${place.country}${place.city ? `, ${place.city}` : ''}. 

The essay should cover:
- Historical background (who built it, when, and why)
- Cultural and historical significance
- Architectural or natural features
- Interesting facts and stories
- Why travelers should visit

Write in an engaging travel magazine style — 4 to 5 paragraphs, no headings, no bullet points, just flowing prose. Make it informative and captivating.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ message: data.error?.message || 'Failed to generate essay' });
    }

    const essay = data.content[0].text;

    // Cache essay in MongoDB
    place.historicalEssay = essay;
    await place.save();

    res.json({ essay, cached: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateEssay };