console.log('recipes.js loaded');

const recipes = [
    {
        id: 1,
        title: "Mediterranean Salad",
        time: "15 mins",
        calories: "320",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
        category: "vegetarian",
        subCategory: "Salads"
    },
    {
        id: 2,
        title: "Grilled Chicken & Vegetables",
        time: "30 mins",
        calories: "450",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
        category: "low-carb",
        subCategory: "Main Course"
    },
    {
        id: 3,
        title: "Quinoa Buddha Bowl",
        time: "20 mins",
        calories: "380",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        category: "vegan",
        subCategory: "Main Course"
    },
    {
        id: 4,
        title: "Spicy Thai Curry",
        time: "35 mins",
        calories: "420",
        image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd",
        category: "spicy",
        subCategory: "Main Course"
    },
    {
        id: 5,
        title: "Grilled Salmon",
        time: "25 mins",
        calories: "380",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
        category: "seafood",
        subCategory: "Main Course"
    },
    {
        id: 6,
        title: "Avocado Toast",
        time: "10 mins",
        calories: "280",
        image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d",
        category: "breakfast",
        subCategory: "Breakfast"
    },
    {
        id: 7,
        title: "Chocolate Lava Cake",
        time: "20 mins",
        calories: "450",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
        category: "desserts",
        subCategory: "Desserts"
    },
    // Add more recipes as needed
];

const categories = {
    vegetarian: {
        icon: 'fa-leaf',
        subCategories: ['Salads', 'Soups', 'Stir-Fry', 'Pasta'],
        color: '#059669'
    },
    'gluten-free': {
        icon: 'fa-wheat-awn-circle-exclamation',
        subCategories: ['Breakfast', 'Main Course', 'Snacks'],
        color: '#d97706'
    },
    'quick-meals': {
        icon: 'fa-clock',
        subCategories: ['15-min Meals', '30-min Meals', 'One-Pot'],
        color: '#dc2626'
    },
    // Add other categories...
};

class RecipeManager {
    static getRecipes() {
        return recipes;
    }

    static getCategories() {
        return categories;
    }

    static filterRecipes(category) {
        if (!category || category === 'All Recipes') {
            return recipes;
        }
        return recipes.filter(recipe => recipe.category.toLowerCase() === category.toLowerCase());
    }

    static searchRecipes(query) {
        return recipes.filter(recipe => 
            recipe.title.toLowerCase().includes(query.toLowerCase())
        );
    }

    static generateRecipeCard(recipe) {
        return `
            <div class="recipe-card bg-white rounded-lg shadow-sm overflow-hidden" data-recipe-id="${recipe.id}">
                <div class="drag-handle cursor-move">
                    <img src="${recipe.image}" class="w-full h-48 object-cover" alt="${recipe.title}"/>
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-gray-900 mb-2">${recipe.title}</h3>
                    <div class="flex items-center text-sm text-gray-500 mb-4">
                        <i class="fas fa-clock mr-2"></i>${recipe.time}
                        <span class="mx-2">•</span>
                        <i class="fas fa-fire mr-2"></i>${recipe.calories} cal
                    </div>
                    <div class="flex justify-between">
                        <button class="add-to-plan-btn !rounded-button bg-custom/10 text-custom px-3 py-1.5 text-sm font-medium">
                            <i class="fas fa-plus mr-2"></i>Add to Plan
                        </button>
                        <button class="favorite-btn text-gray-400 hover:text-custom">
                            <i class="fas fa-heart text-xl"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static filterRecipesBySubCategory(category, subCategory) {
        return recipes.filter(recipe => 
            recipe.category === category && 
            recipe.subCategory === subCategory
        );
    }

    static generateSubCategoryMenu(category) {
        const categoryData = categories[category];
        return `
            <div class="sub-category-menu bg-white rounded-lg shadow-lg p-4 absolute left-0 right-0 mt-2 z-20">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    ${categoryData.subCategories.map(sub => `
                        <button class="sub-category-btn text-left p-3 rounded-lg hover:bg-gray-50 transition-all"
                                data-category="${category}"
                                data-sub-category="${sub}">
                            <span class="block font-medium text-gray-900">${sub}</span>
                            <span class="text-sm text-gray-500">
                                ${this.getRecipeCountForSubCategory(category, sub)} Recipes
                            </span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    static getRecipeCountForSubCategory(category, subCategory) {
        return recipes.filter(recipe => 
            recipe.category === category && 
            recipe.subCategory === subCategory
        ).length;
    }
}

window.RecipeManager = RecipeManager; 