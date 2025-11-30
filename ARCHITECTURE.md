# CampusSwap Frontend Architecture

## 📁 Project Structure

```
campusswap/
├── index.html                    # Main HTML entry point
├── src/
│   ├── js/
│   │   ├── app.js               # Main application controller (MVC Controller)
│   │   ├── config.js            # Configuration constants
│   │   ├── components/          # UI Components (View Layer)
│   │   │   ├── AuthComponent.js       # Authentication modals
│   │   │   ├── CartComponent.js       # Shopping cart UI
│   │   │   └── ProductComponent.js    # Product display
│   │   ├── services/            # Business Logic Layer
│   │   │   ├── api.service.js         # API communication
│   │   │   ├── auth.service.js        # Authentication logic
│   │   │   └── cart.service.js        # Cart management
│   │   └── utils/               # Helper Functions
│   │       └── helpers.js             # Reusable utilities
│   └── styles/
│       └── main.css             # Stylesheet
└── main.js                      # DEPRECATED - 2145 lines monolith
```

## 🏗️ Architecture Pattern: MVC (Model-View-Controller)

### **Why MVC?**
- **Separation of Concerns**: Each layer has a single responsibility
- **Maintainability**: Easy to find and fix bugs
- **Scalability**: Add new features without breaking existing code
- **Testability**: Each module can be tested independently
- **Industry Standard**: Used by React, Angular, Vue, etc.

### **Layer Breakdown:**

#### 1. **Model Layer (Services)**
- `api.service.js`: All HTTP requests to backend
- `auth.service.js`: User authentication state
- `cart.service.js`: Shopping cart state
- **Responsibility**: Data management and business logic

#### 2. **View Layer (Components)**
- `ProductComponent.js`: Renders product grids
- `CartComponent.js`: Renders cart modal
- `AuthComponent.js`: Renders login/register forms
- **Responsibility**: UI rendering and user input

#### 3. **Controller Layer**
- `app.js`: Coordinates services and components
- **Responsibility**: Application flow and event handling

## 🔄 Data Flow

```
User Interaction → Component → Controller → Service → API
                                                ↓
User sees update ← Component ← Controller ← Response
```

**Example: Adding to Cart**
1. User clicks "Add to Cart" button (View)
2. `ProductComponent` calls controller method
3. `AppController.addToCart()` validates user
4. `cartService.addItem()` makes API call
5. `apiService.addToCart()` sends HTTP request
6. Backend processes and responds
7. `cartService` updates local state
8. `CartComponent` re-renders with new data

## 📦 Module Responsibilities

### `config.js`
- Centralized configuration
- API URLs, token keys, constants
- Easy to change environments (dev/prod)

### `api.service.js`
- **Single Responsibility**: HTTP communication
- Handles authentication headers
- Error handling
- All backend endpoints in one place

### `auth.service.js`
- **Single Responsibility**: User authentication
- Token storage/retrieval
- Login/logout/register logic
- User state management

### `cart.service.js`
- **Single Responsibility**: Cart management
- Add/update/remove items
- Calculate totals
- Sync with backend

### `ProductComponent.js`
- **Single Responsibility**: Product UI
- Render product cards
- Handle product interactions
- No business logic

### `CartComponent.js`
- **Single Responsibility**: Cart UI
- Render cart modal
- Display items and totals
- No business logic

### `AuthComponent.js`
- **Single Responsibility**: Auth UI
- Render login/register forms
- Form validation
- No API calls (delegates to service)

### `app.js` (Main Controller)
- **Orchestrates** all modules
- Initializes app
- Sets up event listeners
- Coordinates services and components
- Main entry point

## 🎯 Design Principles Applied

### 1. **Single Responsibility Principle (SRP)**
Each module does ONE thing well.
- API service only makes HTTP calls
- Auth service only handles authentication
- Components only render UI

### 2. **Don't Repeat Yourself (DRY)**
- Reusable utility functions in `helpers.js`
- Centralized API calls in `api.service.js`
- No duplicate code

### 3. **Separation of Concerns**
- Business logic ≠ UI logic
- API calls ≠ rendering
- State management ≠ display

### 4. **Dependency Injection**
- Components receive callbacks from controller
- Services don't know about UI
- Easy to swap implementations

### 5. **Modularity**
- ES6 modules (`import/export`)
- Each file is self-contained
- Easy to add/remove features

## 🚀 Benefits Over Monolithic `main.js`

| Aspect | Old (2145 lines) | New (Modular) |
|--------|-----------------|---------------|
| **Readability** | 😱 Scroll forever | ✅ < 200 lines per file |
| **Debugging** | 🐛 Where's the bug? | ✅ Check relevant module |
| **Testing** | ❌ Test entire app | ✅ Test individual modules |
| **Collaboration** | ⚠️ Merge conflicts | ✅ Work on different files |
| **Maintenance** | 😓 Change breaks things | ✅ Isolated changes |
| **Performance** | 🐢 Load everything | ⚡ Tree-shaking possible |

## 📚 How to Add New Features

### Example: Adding "Favorites" Feature

1. **Create Service** (`src/js/services/favorites.service.js`)
```javascript
class FavoritesService {
    async addFavorite(productId) { /* ... */ }
    async getFavorites() { /* ... */ }
}
```

2. **Create Component** (`src/js/components/FavoritesComponent.js`)
```javascript
export class FavoritesComponent {
    renderFavorites(favorites) { /* ... */ }
}
```

3. **Update Controller** (`app.js`)
```javascript
import favoritesService from './services/favorites.service.js';
// Add methods and wire up
```

4. **Update API Service** (if new endpoints needed)
```javascript
async getFavorites() {
    return this.fetch('/favorites');
}
```

✅ **No need to touch existing code!**

## 🔧 Development Workflow

### Running the App
```bash
# Frontend (from campusswap/)
npm run dev

# Backend (from campusswap-backend/)
npm run dev
```

### File Naming Conventions
- **PascalCase**: Components (`ProductComponent.js`)
- **camelCase**: Services (`auth.service.js`)
- **kebab-case**: Utilities (`helpers.js`)

### Import Order
```javascript
// 1. External libraries (if any)
import Chart from 'chart.js';

// 2. Services
import authService from './services/auth.service.js';

// 3. Components
import { ProductComponent } from './components/ProductComponent.js';

// 4. Utils
import { formatCurrency } from './utils/helpers.js';
```

## 🎓 EECS 4413 Concepts Applied

- ✅ **MVC Pattern**: Industry-standard architecture
- ✅ **Separation of Concerns**: Each module has one job
- ✅ **RESTful API Design**: Services mirror backend endpoints
- ✅ **State Management**: Centralized in services
- ✅ **Component-Based UI**: Reusable, testable components
- ✅ **ES6 Modules**: Modern JavaScript practices
- ✅ **Async/Await**: Proper asynchronous handling
- ✅ **Error Handling**: Try/catch in every async operation

## 📖 Next Steps

1. ✅ **Refactored to modular architecture**
2. ⏳ **Add Chart.js for admin sales visualization**
3. ⏳ **Implement image upload with Multer**
4. ⏳ **Add Luhn algorithm for payment validation**
5. ⏳ **Complete admin dashboard features**
6. ⏳ **Write unit tests for services**
7. ⏳ **Deploy to production**

## 🤝 Contributing

When adding new features:
1. Create appropriate service/component
2. Update controller to wire it up
3. Keep modules < 300 lines
4. Document public methods
5. Follow existing patterns

---

**Built with ❤️ following EECS 4413 best practices**
