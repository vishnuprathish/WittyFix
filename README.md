# WittyFix Chrome Extension

<div align="center">
  <h3>Enhance your text with AI-powered improvements and humor</h3>
</div>

## 🚀 Features

- **Text Enhancement**: Improve your writing while maintaining the original meaning
- **Humor Injection**: Add contextually relevant humor to your text
- **Privacy First**: Your OpenAI API key is stored securely in Chrome's storage
- **Easy to Use**: Simple interface with context menu integration
- **Fast & Efficient**: Instant text processing with GPT-4

## 📋 Prerequisites

- Google Chrome Browser
- OpenAI API key ([Get one here](https://platform.openai.com/account/api-keys))

## 🔧 Installation

### Local Development
1. Clone this repository:
   ```bash
   git clone https://github.com/vishnuprathish/wittyfix.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

### From Chrome Web Store
*(Coming soon)*

## 🔑 Setup

1. Click the WittyFix icon in your Chrome toolbar
2. Enter your OpenAI API key in the popup
3. Start enhancing your text!

## 📝 Usage

1. Select any text on a webpage
2. Either:
   - Click the WittyFix icon and choose an option
   - Right-click and select one of the WittyFix options from the context menu
3. Wait for the AI to process and improve your text

## 🔒 Security

- Your OpenAI API key is stored securely in Chrome's storage sync
- No data is stored or transmitted except for the selected text being sent to OpenAI
- All communication with OpenAI is done via HTTPS

## 🛠️ Development

### Project Structure
```
wittyfix/
├── manifest.json        # Extension configuration
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality
├── content.js          # Content script for text processing
├── background.js       # Background script for context menu
└── icons/              # Extension icons
```

### Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- OpenAI for providing the GPT-4 API
- Chrome Extensions documentation and community
- All contributors who help improve this project

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/vishnuprathish/wittyfix/issues) on GitHub.
