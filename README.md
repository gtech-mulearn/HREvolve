# HR Evolve - Next.js Website

This is a modern Next.js conversion of the HR Evolve website with Tailwind CSS styling.

## Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS for styling
- 📱 Fully responsive design
- 🖼️ Optimized images with Next.js Image component
- 🎭 Interactive components with smooth animations
- 📧 Contact form integration
- 🔗 Social media integration

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
   ```bash
   cd hrevolve-nextjs
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
hrevolve-nextjs/
├── public/                 # Static assets (images, icons, etc.)
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── globals.css    # Global styles with Tailwind
│   │   ├── layout.tsx     # Root layout component
│   │   └── page.tsx       # Home page
│   └── components/        # React components
│       ├── Header.tsx     # Navigation header
│       ├── Hero.tsx       # Hero section with image slider
│       ├── About.tsx      # About section
│       ├── Events.tsx     # Events gallery
│       ├── Contact.tsx    # Contact information
│       ├── Footer.tsx     # Footer component
│       └── Modal.tsx      # Modal component
├── tailwind.config.js     # Tailwind configuration
├── next.config.js         # Next.js configuration
└── package.json          # Dependencies and scripts
```

## Components

### Header
- Fixed navigation with backdrop blur effect
- Mobile-responsive hamburger menu
- Smooth scrolling to sections

### Hero
- Automatic image slider with 16 images
- Gradient text effects
- Call-to-action button

### About
- Information about HR Evolve
- Feature highlighting with icons

### Events
- Gallery of past events (17 HR images)
- Upcoming events section
- Membership call-to-action

### Contact
- Contact information with icons
- Social media links
- Interactive hover effects

### Footer
- Company information
- Useful links
- Contact details and social media

## Customization

### Colors
The color scheme can be customized in `tailwind.config.js`:

```javascript
colors: {
  primary: '#6a0dad',    // Deep purple
  secondary: '#ff4500',  // Orange red
  accent: '#ffd700',     // Gold
  background: '#8a2be2', // Blue violet
}
```

### Fonts
The project uses Roboto font loaded from Google Fonts. You can change this in `globals.css`.

## Build and Deploy

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy
The app can be deployed to Vercel, Netlify, or any platform that supports Next.js.

For Vercel (easiest option):
```bash
npm install -g vercel
vercel
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

HR Evolve India
- Email: info@hrevolve.org
- Phone: +91 623535592 / +91 99468 79255
- Address: Technopark Trivandrum, Kerala, India
- LinkedIn: [hr-evolve-india](https://www.linkedin.com/company/hr-evolve-india/)
- Instagram: [@hr_evolve](https://www.instagram.com/hr_evolve)