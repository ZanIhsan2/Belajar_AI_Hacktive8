import 'dotenv/config';
import {GoogleGenAI} from '@google/genai';
import express from 'express';
import multer from 'multer';

const app = express();
const upload = multer();
const port = process.env.PORT || 3000;
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello Hacktiv8!');
});

app.post('/generate-text', async (req, res) => {
  try {
    // ambil prompt dari request body
    const {prompts} = req.body;

    //validasi prompt
    if (!prompts) {
      res.status(400).json({error: 'Prompt is required'});
      return;
    }

    // panggil API gemini untuk generate text
    const response = await ai.models.generateContent({
      model: process.env.MODEL,
      contents: prompts,
    });

    res.status(200).json({result: response.text});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.post('/generate-from-image', upload.single('image'), async (req, res) => {
  try {
    const {prompts} = req.body;
    const base64Image = req.file.buffer.toString('base64');

    const response = await ai.models.generateContent({
      model: process.env.MODEL,
      contents: [
        {text: prompts, type: 'text'},
        {inlineData: {data: bas64Image, mimeType: req.file.mimetype}}
      ],
    });

    res.status(200).json({result: response.text});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.post('/generate-from-document', upload.single('document'), async (req, res) => {
  try {
    const {prompts} = req.body;
    const base64Document = req.file.buffer.toString('base64');

    const response = await ai.models.generateContent({
      model: process.env.MODEL,
      contents: [
        {text: prompts, type: 'text'},
        {inlineData: {data: base64Document, mimeType: req.file.mimetype}}
      ],
    });

    res.status(200).json({result: response.text});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});