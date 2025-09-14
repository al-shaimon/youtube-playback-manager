# YouTube Playback Speed Manager

<div align="center">

![Extension Preview](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.0.0-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Take control of YouTube playback speeds beyond the default 0.25x-2x limit!**

</div>

## 🚀 Features

### ⚡ Unlimited Speed Control

- **Extended Range**: Set playback speeds from **0.1x to 10x** (far beyond YouTube's default
  0.25x-2x limit)
- **Precision Control**: Input any custom speed value with decimal precision
- **Instant Application**: Speeds apply immediately to the current video

### 💾 Smart Persistence

- **Auto-Save**: Your preferred speed is automatically saved
- **Cross-Session Memory**: Speeds persist across browser restarts
- **Auto-Apply**: Automatically applies your saved speed to new YouTube videos
- **Per-Video Memory**: Remembers speeds for different videos (optional)

### 🎛️ Quick Controls

- **Preset Buttons**: One-click access to common speeds:
  - 0.25x, 0.5x, 0.75x, 1.0x
  - 1.25x, 1.5x, 1.75x, 2.0x
  - 2.5x, 3.0x, 4.0x, 5.0x
- **Manual Input**: Type any custom speed value
- **Visual Feedback**: Current speed is prominently displayed

### ⚙️ Customization Options

- **Auto-Apply Toggle**: Choose whether to automatically apply saved speeds
- **Notification Settings**: Control extension feedback messages
- **Reset Function**: Quickly return to normal 1.0x speed

## 📦 Installation

### Method 1: Install from Chrome Web Store (Recommended)

> _Coming soon - extension will be published to the Chrome Web Store_

### Method 2: Manual Installation (Developer Mode)

1. **Download the Extension**

   ```bash
   git clone https://github.com/al-shaimon/youtube-playback-manager.git
   cd youtube-playback-manager
   ```

2. **Open Chrome Extensions Page**

   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or click the three dots menu → More Tools → Extensions

3. **Enable Developer Mode**

   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**

   - Click "Load unpacked" button
   - Navigate to the downloaded extension folder
   - Select the folder containing `manifest.json`
   - Click "Select Folder"

5. **Verify Installation**
   - The extension should appear in your extensions list
   - You'll see the YouTube Speed Manager icon in your toolbar
   - Navigate to any YouTube video to test

## 🎯 Usage Guide

### Basic Usage

1. **Open YouTube** and play any video
2. **Click the extension icon** in your Chrome toolbar
3. **Set your desired speed** using either:
   - Quick preset buttons (0.25x - 5.0x)
   - Manual input field (0.1x - 10.0x)
4. **Click "Apply Speed"** or press Enter
5. **Watch your video** at the new speed!

### Advanced Features

#### Auto-Apply Settings

- **Enable Auto-Apply**: New videos will automatically use your saved speed
- **Disable Auto-Apply**: Manually set speed for each video

#### Speed Persistence

- **Remember Speed**: Your last used speed is saved automatically
- **Cross-Session**: Speeds persist even after closing and reopening Chrome
- **Reset Option**: Use the "Reset to Default" button to return to 1.0x

#### Custom Speeds

- **Extreme Slow Motion**: Try 0.1x - 0.25x for detailed analysis
- **Normal Speeds**: 0.5x - 2.0x for typical viewing
- **High Speed**: 2.5x - 10.0x for quick consumption

## 🛠️ Technical Details

### Architecture

- **Manifest V3**: Built using the latest Chrome extension standards
- **Content Script**: Directly manipulates YouTube's video player
- **Background Service**: Monitors tab changes and applies speeds
- **Popup Interface**: Clean, responsive UI for speed control

### File Structure

```
youtube-playback-manager/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── content.js             # YouTube page interaction
├── background.js          # Background service worker
├── icons/                 # Extension icons
└── README.md              # This documentation
```

### Permissions Used

- `storage`: Save user preferences and speed settings
- `activeTab`: Access current YouTube tab for speed control
- `host_permissions`: Interact with YouTube pages

### Browser Compatibility

- **Chrome**: Version 88+ (Manifest V3 support)
- **Edge**: Version 88+ (Chromium-based)
- **Other Chromium browsers**: Should work with Manifest V3 support

## 🔧 Troubleshooting

> **Disclaimer:** Using very high or very low playback speeds for extended periods can cause issues
> with video loading, playback availability, or content restrictions on YouTube. In some cases,
> videos may fail to load correctly or display a "content not available" message when played at
> extreme speeds. If you encounter such behavior, reduce the playback speed toward normal (e.g.,
> 1.0x), refresh the page, or disable the extension temporarily.

### Common Issues

#### Speed Not Applying

- **Refresh the page** and try again
- **Check if video is fully loaded** before applying speed
- **Disable other video-related extensions** temporarily
- **Clear browser cache** if issues persist

#### Extension Not Visible

- **Check Extensions page**: `chrome://extensions/`
- **Ensure extension is enabled**
- **Pin the extension** to your toolbar for easy access

#### Speeds Not Persisting

- **Check storage permissions** in extension settings
- **Ensure "Auto-apply" is enabled**
- **Try refreshing YouTube page**

#### Performance Issues

- **Extreme speeds (above 5x)** may cause audio/video sync issues
- **Very slow speeds (below 0.25x)** may appear choppy
- **Consider using normal browser zoom** for visual magnification needs

### Reset Instructions

If you encounter persistent issues:

1. **Disable the extension**
2. **Clear extension data**:
   - Go to `chrome://settings/content/all`
   - Find YouTube entries and clear storage
3. **Re-enable the extension**
4. **Test with a fresh YouTube page**

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/al-shaimon/youtube-playback-manager.git
   ```
3. **Load in Chrome** using developer mode
4. **Make your changes**
5. **Test thoroughly** on various YouTube videos
6. **Submit a pull request**

### Contribution Guidelines

- **Code Style**: Follow existing JavaScript/CSS patterns
- **Testing**: Test on multiple YouTube video types
- **Documentation**: Update README for new features
- **Compatibility**: Ensure Chrome/Edge compatibility

## 📝 Changelog

### Version 1.0.0 (Current)

- ✅ Initial release
- ✅ Speed range: 0.1x - 10.0x
- ✅ Persistent speed storage
- ✅ Auto-apply functionality
- ✅ 12 preset speed buttons
- ✅ Clean, responsive UI
- ✅ Background tab monitoring

### Planned Features

- 🔮 Keyboard shortcuts
- 🔮 Speed profiles for different video types
- 🔮 Integration with YouTube Shorts
- 🔮 Advanced speed scheduling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

### Getting Help

- **GitHub Issues**:
  [Report bugs or request features](https://github.com/al-shaimon/youtube-playback-manager/issues)
- **Documentation**: Check this README for detailed information
- **Community**: Join discussions in the Issues section

### Contact

- **Developer**: [Al Shaimon](https://github.com/al-shaimon)
- **Email**: Contact through GitHub profile
- **Website**: [Portfolio](https://alshaimon.com)

---

<div align="center">

**⭐ If this extension helps you, please consider giving it a star on GitHub! ⭐**

[🔗 GitHub Repository](https://github.com/al-shaimon/youtube-playback-manager) |
[🐛 Report Issues](https://github.com/al-shaimon/youtube-playback-manager/issues) |
[💡 Feature Requests](https://github.com/al-shaimon/youtube-playback-manager/issues/new)

</div>

## 🏷️ Tags

`chrome-extension` `youtube` `playback-speed` `video-player` `productivity` `javascript`
`manifest-v3` `browser-extension` `speed-control` `youtube-enhancement`
