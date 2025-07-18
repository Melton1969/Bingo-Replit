# Bingo Web App

An interactive educational vocabulary game builder for teachers and students. Create, manage, and play bingo games with drag-and-drop functionality and drawing tools.

## 🎯 Features

### 👩‍🏫 Admin Interface
- **Game Management**: Create, edit, delete, and organize bingo games
- **Folder System**: Hierarchical organization of vocabulary images
- **Image Upload**: Drag-and-drop image uploads with batch operations
- **Category Filtering**: Organize games by educational categories
- **Link Generation**: Automatic short links for easy game sharing

### 🎮 Player Interface
- **Drag & Drop Gameplay**: Intuitive image placement on bingo boards
- **Drawing Tools**: Pen, eraser, colors, and adjustable brush sizes
- **Touch Support**: Fully responsive for tablets and mobile devices
- **Background Themes**: Optional background images for enhanced gameplay
- **Grid Sizes**: Support for 3x3, 4x4, 5x5, and 6x6 bingo boards

### 🛠 Technical Features
- **Real-time Database**: Supabase PostgreSQL with real-time updates
- **File Storage**: Integrated image storage and management
- **API Routes**: RESTful endpoints for all operations
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Data Validation**: Form validation and error handling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/bingo-web-app.git
cd bingo-web-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

4. **Set up the database**
- Run the SQL schema from `/lib/database-schema.sql` in your Supabase SQL editor
- Create a storage bucket named `bingo-images` in Supabase Storage

5. **Seed the database (optional)**
```bash
npm run dev
# Visit http://localhost:3000/test
# Click "Seed Database with Test Data"
```

6. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📚 Usage

### For Teachers (Admin)
1. Visit `/admin` to access the admin interface
2. Create games by selecting images from folders
3. Configure grid size, background, and category
4. Share the generated game links with students

### For Students (Players)
1. Access games via shared links (`/play/[gameId]`)
2. Drag images from the left panel to the bingo board
3. Use drawing tools to mark or highlight squares
4. Reset the game anytime to play again

## 🏗 Project Structure

```
/
├── components/
│   ├── admin/          # Admin interface components
│   ├── player/         # Player interface components
│   └── shared/         # Reusable components
├── pages/
│   ├── api/            # API routes
│   ├── play/           # Player pages
│   ├── admin.tsx       # Admin interface
│   └── test.tsx        # Testing utilities
├── lib/
│   ├── supabase.js     # Database client
│   ├── api.js          # API utilities
│   └── database-schema.sql
├── hooks/              # Custom React hooks
└── styles/             # CSS and styling
```

## 🔧 API Endpoints

### Games
- `GET /api/games` - List all games
- `POST /api/games` - Create new game
- `GET /api/games/[id]` - Get game details
- `PUT /api/games/[id]` - Update game
- `DELETE /api/games/[id]` - Delete game

### Folders & Images
- `GET /api/folders` - Get folder tree
- `GET /api/folders/[id]/images` - Get folder images
- `POST /api/images/upload` - Upload images
- `DELETE /api/images/batch` - Batch delete images

### Utilities
- `POST /api/seed` - Seed database with test data
- `GET /api/backgrounds` - Get background images

## 🎨 Customization

### Adding New Backgrounds
1. Add background images to Supabase Storage
2. Insert records in the `background_images` table
3. Images will appear in the game creation modal

### Custom Styling
- Modify `styles/globals.css` for custom CSS
- Update `tailwind.config.js` for theme customization
- Component-specific styles in individual files

## 📱 Mobile Support

The app is fully responsive and supports:
- Touch drag-and-drop on mobile devices
- Responsive toolbar that adapts to screen size
- Mobile-optimized image panels and navigation
- Touch-friendly drawing tools

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- File upload validation and size limits
- API input validation and sanitization
- Environment variable protection

## 🧪 Testing

Visit `/test` to:
- Seed the database with sample data
- Test API endpoints
- Verify Supabase connectivity
- Check component functionality

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm run start
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

## 🗺 Roadmap

- [ ] Text-to-Speech integration
- [ ] Student progress tracking
- [ ] Multi-language support
- [ ] Advanced drawing tools
- [ ] Collaborative gameplay
- [ ] Game templates
- [ ] Export functionality

Built with ❤️ using Next.js, React, Tailwind CSS, and Supabase.