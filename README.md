# 🎸 Alex Wilson Country Song Generator

A modern web application that generates authentic country songs using AI, inspired by Pike County's finest traditions. Create radio-ready hits or deep storytelling ballads with the help of Claude AI.

![Country Song Generator](https://img.shields.io/badge/Country-Music-D2691E?style=for-the-badge&logo=guitar&logoColor=white)
![Claude AI](https://img.shields.io/badge/Powered%20by-Claude%20AI-4B0082?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

## ✨ Features

- **🎵 AI-Powered Song Generation**: Create authentic country songs with Claude AI
- **🎚️ Style Slider**: Balance between radio hits and storytelling masterpieces
- **🎭 Multiple Vocal Styles**: Solo male, solo female, or duet options
- **🎨 Two Interface Modes**:
  - **Classic Mode**: All options on one page
  - **Wizard Mode**: Step-by-step guided creation
- **✏️ Edit Functionality**: Modify generated lyrics, style, and notes
- **💾 Multiple Export Options**: Save as JSON, Markdown, or PDF
- **📱 Responsive Design**: Works beautifully on all devices
- **🌓 Dark Mode**: Easy on the eyes during late-night songwriting
- **📜 Song History**: Keep track of all your creations

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Anthropic API key for Claude

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/country-song-generator.git
cd country-song-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
```

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

6. Enter your Claude API key in the Settings (gear icon in the header)

## 🎮 How to Use

### Classic Mode
1. Move the style slider to choose between "Radio Hit" and "Story Song"
2. Enter a theme or concept for your song
3. Select optional parameters (sub-genre, mood, vocal style)
4. Add any additional notes or specific elements
5. Click "Generate Song"

### Wizard Mode
1. Switch to Wizard Mode using the toggle button
2. Follow the step-by-step guide:
   - Step 1: Choose style and theme
   - Step 2: Select genre and mood
   - Step 3: Add optional details
   - Step 4: Review and generate

### Editing Songs
- Click the "Edit" button next to any section
- Modify the content in the text area
- Save changes or cancel to revert

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **AI**: Anthropic Claude API
- **Styling**: Custom CSS with CSS Variables
- **Export**: jsPDF for PDF generation

## 📁 Project Structure

```
country-song-generator/
├── public/
│   ├── index.html      # Main HTML file
│   ├── style.css       # Modern, responsive styles
│   └── script.js       # Frontend JavaScript
├── server.js           # Express server
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (create this)
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## 🎨 Features in Detail

### Style Slider
- **Radio Hit (0-20)**: Maximum hook appeal, simple and catchy
- **Hook-Forward (21-40)**: Strong commercial appeal with some storytelling
- **Balanced (41-60)**: Equal focus on hooks and narrative
- **Story-Forward (61-80)**: Narrative priority with memorable moments
- **Artistic (81-100)**: Full storytelling focus with complex narratives

### Song Elements
- **Instruments**: From acoustic guitar to 808 bass
- **Tempo & Key**: Various BPM options and musical keys
- **Keywords**: Classic country imagery (dirt roads, pickup trucks, etc.)
- **Topics**: Love, heartbreak, small-town life, and more

## 🔒 Security

- API keys are stored server-side only
- No sensitive data is stored in localStorage
- All user inputs are properly sanitized

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the authentic country music traditions of Pike County, Kentucky
- Built with Claude AI by Anthropic
- Icons by Font Awesome
- PDF generation by jsPDF

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Ensure your Claude API key is valid and has sufficient credits

## 🎵 About Alex Wilson

Alexander "Alex" Wilson is a fictional country singer-songwriter from Pike County, Kentucky, born July 12, 2005. With a deep, gravel-warm voice reminiscent of Johnny Cash and Chris Stapleton, Alex represents the authentic Appalachian storytelling tradition.

**Signature Songs**: "Tin Band Dreams," "Biscuits & Regret," "Digital Bonfire," "Barstool Confessions," "Check Engine Light Love"

---

Made with ❤️ and 🎸 by [Your Name]
