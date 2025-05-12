const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate a meal using OpenAI
router.post('/generate-meal', async (req, res) => {
  try {
    const { mealType, preferences, calorieRange, cookingTime } = req.body;
    
    // Validate required parameters
    if (!mealType) {
      return res.status(400).json({ error: 'Meal type is required' });
    }
    
    // Build the prompt for OpenAI
    const prompt = `Generate a detailed recipe for a ${mealType} that:
${preferences ? `- Follows these dietary preferences: ${preferences}` : ''}
${calorieRange ? `- Has approximately ${calorieRange} calories per serving` : ''}
${cookingTime ? `- Can be prepared in about ${cookingTime} minutes` : ''}

Format the response as a JSON object with the following fields:
{
  "id": "unique-identifier-string",
  "title": "Meal Name",
  "type": "breakfast|lunch|dinner|snack",
  "description": "A brief, appetizing description of the dish",
  "calories": number_of_calories_per_serving,
  "servings": number_of_servings,
  "cookingTime": number_of_minutes,
  "ingredients": [
    "ingredient 1 with quantity",
    "ingredient 2 with quantity"
  ],
  "instructions": [
    "step 1",
    "step 2"
  ],
  "nutritionalInfo": {
    "protein": "X grams",
    "carbs": "X grams",
    "fat": "X grams",
    "fiber": "X grams"
  }
}`;

    // Generate response from OpenAI
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: "You are a professional chef specializing in nutritious meals. Always respond with properly formatted JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    // Parse the response
    const responseText = response.choices[0].message.content.trim();
    let meal;
    
    try {
      // Try to parse the JSON response
      meal = JSON.parse(responseText);
      
      // Add a timestamp for when this meal was generated
      meal.generatedAt = new Date().toISOString();
      
      // Generate an image for the meal
      const imageDescription = `A professional food photography image of ${meal.title}, a ${meal.type} dish. ${meal.description || ''}`;
      
      try {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: imageDescription,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        });
        
        if (imageResponse && imageResponse.data && imageResponse.data.length > 0) {
          meal.imageUrl = imageResponse.data[0].url;
        }
      } catch (imageError) {
        console.error('Error generating meal image:', imageError);
        // Don't fail the whole request if image generation fails
        meal.imageUrl = null;
      }
      
      res.json(meal);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // If parsing fails, return the raw response
      res.status(500).json({ 
        error: 'Failed to parse meal data', 
        rawResponse: responseText 
      });
    }
  } catch (error) {
    console.error('Error generating meal:', error);
    res.status(500).json({ 
      error: 'Failed to generate meal',
      message: error.message 
    });
  }
});

// Generate an image for a meal
router.post('/generate-image', async (req, res) => {
  try {
    const { mealTitle, mealType, description } = req.body;
    
    if (!mealTitle) {
      return res.status(400).json({ error: 'Meal title is required' });
    }
    
    // Construct a prompt for the image
    const imagePrompt = `A professional food photography image of ${mealTitle}, a ${mealType || 'delicious'} dish. ${description || ''}`;
    
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    
    if (imageResponse && imageResponse.data && imageResponse.data.length > 0) {
      res.json({ imageUrl: imageResponse.data[0].url });
    } else {
      res.status(500).json({ error: 'Failed to generate image' });
    }
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      message: error.message 
    });
  }
});

module.exports = router;