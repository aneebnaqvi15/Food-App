console.log('main.js loaded');

class RecipeApp {
    constructor() {
        console.log('RecipeApp initialized');
        this.initializeRecipes();
        this.initializeSearch();
        this.initializeFilters();
        this.initializeModal();
        this.initializeNavigation();
        this.initializeSlider();
        this.initializeShoppingList();
        this.initializeRecipeCards();
        this.loadFavorites();
        
        // Initialize drag and drop
        new DragDropHandler();
    }

    initializeRecipes() {
        const recipeGrid = document.querySelector('.recipe-grid');
        const recipes = RecipeManager.getRecipes();
        
        recipeGrid.innerHTML = recipes.map(recipe => 
            RecipeManager.generateRecipeCard(recipe)
        ).join('');
    }

    initializeSearch() {
        const searchContainer = document.querySelector('.search-container');
        const searchInput = searchContainer.querySelector('input');
        const searchResults = searchContainer.querySelector('.search-results');
        
        searchInput.addEventListener('input', this.debounce((e) => {
            const query = e.target.value.trim();
            
            if (query.length > 0) {
                const recipes = RecipeManager.searchRecipes(query);
                this.showSearchResults(recipes, searchResults);
            } else {
                this.hideSearchResults(searchResults);
            }
        }, 300));

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                this.hideSearchResults(searchResults);
            }
        });
    }

    showSearchResults(recipes, resultsContainer) {
        if (recipes.length === 0) {
            resultsContainer.innerHTML = `
                <div class="p-4 text-gray-500 text-center">
                    No recipes found
                </div>
            `;
        } else {
            resultsContainer.innerHTML = recipes.map(recipe => `
                <div class="search-result-item p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3">
                    <img src="${recipe.image}" class="w-12 h-12 rounded-lg object-cover" alt="${recipe.title}"/>
                    <div>
                        <div class="font-medium text-gray-900">${recipe.title}</div>
                        <div class="text-sm text-gray-500">
                            <i class="fas fa-clock mr-1"></i>${recipe.time}
                            <span class="mx-2">•</span>
                            <i class="fas fa-fire mr-1"></i>${recipe.calories} cal
                        </div>
                    </div>
                </div>
            `).join('');

            // Add click handlers to search results
            resultsContainer.querySelectorAll('.search-result-item').forEach((item, index) => {
                item.addEventListener('click', () => {
                    const recipe = recipes[index];
                    searchInput.value = recipe.title;
                    this.hideSearchResults(resultsContainer);
                    this.updateRecipeGrid([recipe]); // Show only the selected recipe
                });
            });
        }

        resultsContainer.classList.remove('hidden');
        
        // Animate results
        gsap.from(resultsContainer.children, {
            opacity: 0,
            y: 10,
            duration: 0.2,
            stagger: 0.05
        });
    }

    hideSearchResults(resultsContainer) {
        gsap.to(resultsContainer, {
            opacity: 0,
            y: 10,
            duration: 0.2,
            onComplete: () => {
                resultsContainer.classList.add('hidden');
                resultsContainer.style.opacity = 1;
                resultsContainer.style.transform = 'none';
            }
        });
    }

    initializeFilters() {
        console.log('Initializing filters');
        const categoryButtons = document.querySelectorAll('.filter-btn');
        
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedCategory = btn.dataset.category;
                console.log('Selected category:', selectedCategory);

                // Update active state of buttons
                categoryButtons.forEach(button => {
                    button.classList.remove('bg-custom/10', 'text-custom');
                    button.classList.add('bg-gray-100', 'text-gray-700');
                });
                btn.classList.remove('bg-gray-100', 'text-gray-700');
                btn.classList.add('bg-custom/10', 'text-custom');

                // Show category modal with recipes
                this.showCategoryModal(selectedCategory);
            });
        });
    }

    showCategoryModal(category) {
        // Create modal HTML
        const modalHTML = `
            <div class="category-modal fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div class="bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
                    <!-- Modal Header -->
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h2 class="text-2xl font-semibold text-gray-900 font-['EB_Garamond']">
                                ${this.getCategoryTitle(category)}
                            </h2>
                            <button class="close-modal text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <p class="text-gray-600 mt-2">${this.getCategoryDescription(category)}</p>
                    </div>
                    
                    <!-- Modal Content -->
                    <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            ${this.getCategoryRecipes(category)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Animate modal entrance
        const modal = document.querySelector('.category-modal');
        const modalContent = modal.querySelector('.bg-white');

        gsap.from(modalContent, {
            scale: 0.9,
            opacity: 0,
            duration: 0.3,
            ease: "back.out(1.7)"
        });

        // Close modal functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            gsap.to(modalContent, {
                scale: 0.9,
                opacity: 0,
                duration: 0.2,
                onComplete: () => modal.remove()
            });
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                gsap.to(modalContent, {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.2,
                    onComplete: () => modal.remove()
                });
            }
        });
    }

    getCategoryTitle(category) {
        const titles = {
            'vegetarian': 'Vegetarian Delights',
            'gluten-free': 'Gluten-Free Recipes',
            'quick-meals': 'Quick & Easy Meals',
            'low-carb': 'Low Carb Favorites',
            'vegan': 'Vegan Cuisine',
            'spicy': 'Spicy Specialties',
            'seafood': 'Seafood Selection',
            'breakfast': 'Breakfast & Brunch',
            'desserts': 'Sweet Treats',
            'all': 'All Recipes'
        };
        return titles[category] || 'Featured Recipes';
    }

    getCategoryDescription(category) {
        const descriptions = {
            'vegetarian': 'Discover delicious meat-free dishes packed with fresh vegetables and plant-based proteins.',
            'gluten-free': 'Explore tasty recipes without gluten, perfect for those with celiac disease or gluten sensitivity.',
            'quick-meals': 'Ready in 30 minutes or less, these recipes are perfect for busy weeknights.',
            'low-carb': 'Low-carb recipes that don\'t compromise on flavor.',
            'vegan': 'Plant-based recipes that are both nutritious and delicious.',
            'spicy': 'Add some heat to your kitchen with these flavorful spicy dishes.',
            'seafood': 'Fresh and flavorful seafood recipes from around the world.',
            'breakfast': 'Start your day right with these breakfast favorites.',
            'desserts': 'Indulge in these sweet and satisfying dessert recipes.',
            'all': 'Browse our complete collection of tested and proven recipes.'
        };
        return descriptions[category] || 'Explore our carefully curated recipes.';
    }

    getCategoryRecipes(category) {
        // Define category-specific recipes
        const categoryRecipes = {
            'vegetarian': [
                {
                    title: "Mediterranean Quinoa Bowl",
                    time: "25 mins",
                    calories: "350",
                    difficulty: "Easy",
                    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
                },
                {
                    title: "Spinach and Mushroom Pasta",
                    time: "30 mins",
                    calories: "420",
                    difficulty: "Medium",
                    image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856"
                }
            ],
            'gluten-free': [
                {
                    title: "Grilled Chicken & Vegetables",
                    time: "35 mins",
                    calories: "380",
                    difficulty: "Easy",
                    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
                }
            ],
            // Add more categories as needed
        };

        // Get recipes for the selected category or use default recipes
        const recipes = categoryRecipes[category] || [
            {
                title: "Featured Recipe",
                time: "30 mins",
                calories: "400",
                difficulty: "Medium",
                image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe"
            }
        ];

        return recipes.map(recipe => `
            <div class="recipe-modal-card bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                <img src="${recipe.image}" class="w-full h-48 object-cover" alt="${recipe.title}"/>
                <div class="p-4">
                    <h3 class="font-semibold text-gray-900 mb-2 font-['EB_Garamond']">${recipe.title}</h3>
                    <div class="flex items-center text-sm text-gray-500 mb-4">
                        <span class="flex items-center">
                            <i class="fas fa-clock mr-1"></i>${recipe.time}
                        </span>
                        <span class="mx-2">•</span>
                        <span class="flex items-center">
                            <i class="fas fa-fire mr-1"></i>${recipe.calories} cal
                        </span>
                        <span class="mx-2">•</span>
                        <span class="flex items-center">
                            <i class="fas fa-chart-simple mr-1"></i>${recipe.difficulty}
                        </span>
                    </div>
                    <div class="flex gap-2">
                        <button class="flex-1 !rounded-button bg-custom/10 text-custom px-3 py-2 text-sm font-medium hover:bg-custom hover:text-white transition-colors">
                            View Recipe
                        </button>
                        <button class="!rounded-button bg-custom/10 text-custom px-3 py-2 text-sm font-medium hover:bg-custom hover:text-white transition-colors">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    initializeModal() {
        console.log('Initializing modals');

        // Get all modal elements
        const addRecipeModal = document.getElementById('addRecipeModal');
        const signInModal = document.getElementById('signInModal');
        const registerModal = document.getElementById('registerModal');

        // Get all trigger buttons
        const addRecipeBtn = document.querySelector('.add-recipe-btn');
        const signInBtns = document.querySelectorAll('.sign-in-btn');
        const registerBtns = document.querySelectorAll('.register-btn');

        // Add Recipe Button
        addRecipeBtn?.addEventListener('click', () => {
            console.log('Add recipe clicked');
            this.showModal(addRecipeModal);
        });

        // Sign In Buttons
        signInBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Sign in clicked');
                this.showModal(signInModal);
            });
        });

        // Register Buttons
        registerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Register clicked');
                this.showModal(registerModal);
            });
        });

        // Modal switching
        document.querySelector('.show-register-modal')?.addEventListener('click', () => {
            this.hideModal(signInModal);
            this.showModal(registerModal);
        });

        document.querySelector('.show-signin-modal')?.addEventListener('click', () => {
            this.hideModal(registerModal);
            this.showModal(signInModal);
        });

        // Close buttons
        document.querySelectorAll('.modal-close, .close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                this.hideModal(modal);
            });
        });

        // Close on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });

        // Form submissions
        const signInForm = document.getElementById('signInForm');
        const registerForm = document.getElementById('registerForm');

        signInForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Sign in form submitted');
            this.handleSignIn(e);
        });

        registerForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Register form submitted');
            this.handleRegister(e);
        });

        // Password visibility toggle
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.previousElementSibling;
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                btn.querySelector('i').classList.toggle('fa-eye');
                btn.querySelector('i').classList.toggle('fa-eye-slash');
            });
        });
    }

    // Helper methods for modal handling
    showModal(modal) {
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Animate modal entrance
        gsap.from(modal.querySelector('.modal-content'), {
            scale: 0.9,
            opacity: 0,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    }

    hideModal(modal) {
        if (!modal) return;
        gsap.to(modal.querySelector('.modal-content'), {
            scale: 0.9,
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                // Reset form if exists
                const form = modal.querySelector('form');
                form?.reset();
            }
        });
    }

    // Form handling methods
    handleSignIn(e) {
        const form = e.target;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        // Add your authentication logic here
        console.log('Sign in attempt:', { email, password });

        // For demo purposes, show success message
        this.showNotification('Successfully signed in!');
        this.hideModal(document.getElementById('signInModal'));
    }

    handleRegister(e) {
        const form = e.target;
        const firstName = form.querySelector('input[name="firstName"]').value;
        const lastName = form.querySelector('input[name="lastName"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        // Add your registration logic here
        console.log('Register attempt:', { firstName, lastName, email, password });

        // For demo purposes, show success message
        this.showNotification('Registration successful!');
        this.hideModal(document.getElementById('registerModal'));
    }

    initializeShoppingList() {
        const clearAllBtn = document.querySelector('.clear-all-btn');
        clearAllBtn?.addEventListener('click', () => {
            const mealSlots = document.querySelectorAll('.meal-slot');
            mealSlots.forEach(slot => {
                slot.innerHTML = '<span class="text-sm text-gray-500">Drop meal here</span>';
                slot.classList.remove('filled');
            });
        });
    }

    initializeSlider() {
        const slider = document.querySelector('.categories-wrapper');
        const leftArrow = document.querySelector('.slider-arrow.left');
        const rightArrow = document.querySelector('.slider-arrow.right');
        
        const checkArrows = () => {
            const isScrollable = slider.scrollWidth > slider.clientWidth;
            const isAtStart = slider.scrollLeft <= 10;
            const isAtEnd = slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 10;
            
            leftArrow.style.display = (!isScrollable || isAtStart) ? 'none' : 'flex';
            rightArrow.style.display = (!isScrollable || isAtEnd) ? 'none' : 'flex';
        };

        // Scroll handling
        leftArrow.addEventListener('click', () => {
            slider.scrollBy({ left: -200, behavior: 'smooth' });
        });

        rightArrow.addEventListener('click', () => {
            slider.scrollBy({ left: 200, behavior: 'smooth' });
        });

        // Update arrow visibility
        slider.addEventListener('scroll', checkArrows);
        window.addEventListener('resize', checkArrows);
        checkArrows(); // Initial check
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    initializeNavigation() {
        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        mobileMenuBtn?.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            gsap.from(mobileMenu.children, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                stagger: 0.1
            });
        });
    }

    initializeRecipeCards() {
        console.log('Initializing recipe cards');
        const recipeGrid = document.querySelector('.recipe-grid');
        
        if (!recipeGrid) {
            console.error('Recipe grid not found');
            return;
        }
        
        // Add to Plan functionality
        recipeGrid.addEventListener('click', (e) => {
            console.log('Grid clicked', e.target);
            const addToPlanBtn = e.target.closest('.add-to-plan-btn');
            const favoriteBtn = e.target.closest('.favorite-btn');
            
            if (addToPlanBtn) {
                console.log('Add to Plan button found');
                this.handleAddToPlan(addToPlanBtn);
            } else if (favoriteBtn) {
                console.log('Favorite button found');
                this.handleFavorite(favoriteBtn);
            }
        });
    }

    handleAddToPlan(btn) {
        try {
            console.log('Add to Plan clicked');
            const recipeCard = btn.closest('.recipe-card');
            console.log('Recipe card:', recipeCard);
            
            if (!recipeCard) {
                console.error('Recipe card not found');
                return;
            }

            const recipeId = recipeCard.dataset.recipeId;
            console.log('Recipe ID:', recipeId);
            
            // Create and show day selection dialog
            const dialog = document.createElement('div');
            dialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
            dialog.innerHTML = `
                <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 transform transition-all">
                    <h3 class="text-lg font-semibold mb-4">Select Day</h3>
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => `
                            <button class="day-select-btn text-left p-3 rounded-lg hover:bg-gray-50 transition-all border border-gray-200">
                                <span class="block font-medium text-gray-900">${day}</span>
                            </button>
                        `).join('')}
                    </div>
                    <button class="cancel-btn w-full py-2 mt-2 text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
            `;

            document.body.appendChild(dialog);

            // Add animation
            gsap.from(dialog.querySelector('div'), {
                scale: 0.9,
                opacity: 0,
                duration: 0.3,
                ease: "back.out(1.7)"
            });

            // Handle day selection
            dialog.querySelectorAll('.day-select-btn').forEach(dayBtn => {
                dayBtn.addEventListener('click', () => {
                    const selectedDay = dayBtn.querySelector('span').textContent;
                    const mealSlot = document.querySelector(`.meal-slot[data-day="${selectedDay}"]`);

                    if (mealSlot) {
                        // Create meal preview
                        const mealPreview = document.createElement('div');
                        mealPreview.className = 'meal-preview p-2 bg-white rounded-lg shadow-sm';
                        
                        const recipeImage = recipeCard.querySelector('img').src;
                        const recipeTitle = recipeCard.querySelector('h3').textContent;
                        
                        mealPreview.innerHTML = `
                            <div class="relative">
                                <img src="${recipeImage}" class="w-full h-20 object-cover rounded-lg" alt="${recipeTitle}">
                                <button class="remove-meal absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-500 hover:text-white">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <p class="text-sm font-medium mt-2 text-center">${recipeTitle}</p>
                        `;

                        // Clear slot and add preview
                        mealSlot.innerHTML = '';
                        mealSlot.appendChild(mealPreview);
                        mealSlot.classList.add('filled');

                        // Add remove functionality
                        mealPreview.querySelector('.remove-meal').addEventListener('click', () => {
                            mealSlot.innerHTML = '<span class="text-sm text-gray-500">Drop meal here</span>';
                            mealSlot.classList.remove('filled');
                        });

                        // Close dialog with animation
                        gsap.to(dialog.querySelector('div'), {
                            scale: 0.9,
                            opacity: 0,
                            duration: 0.2,
                            onComplete: () => dialog.remove()
                        });

                        // Show success animation on button
                        gsap.to(btn, {
                            scale: 1.1,
                            duration: 0.2,
                            yoyo: true,
                            repeat: 1
                        });

                        // Change button text temporarily
                        const originalHtml = btn.innerHTML;
                        btn.innerHTML = '<i class="fas fa-check mr-2"></i>Added';
                        btn.classList.add('bg-green-500', 'text-white');

                        setTimeout(() => {
                            btn.innerHTML = originalHtml;
                            btn.classList.remove('bg-green-500', 'text-white');
                        }, 2000);

                        // Scroll to meal planner with highlight
                        const daySection = mealSlot.closest('.space-y-4');
                        daySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        gsap.fromTo(daySection,
                            { backgroundColor: 'rgba(42, 77, 208, 0.1)' },
                            { 
                                backgroundColor: 'transparent',
                                duration: 1,
                                delay: 0.5
                            }
                        );

                        // Show success notification
                        this.showNotification(`Recipe added to ${selectedDay}!`);
                    }
                });
            });

            // Handle cancel
            dialog.querySelector('.cancel-btn').addEventListener('click', () => {
                gsap.to(dialog.querySelector('div'), {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.2,
                    onComplete: () => dialog.remove()
                });
            });

            // Close on outside click
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    gsap.to(dialog.querySelector('div'), {
                        scale: 0.9,
                        opacity: 0,
                        duration: 0.2,
                        onComplete: () => dialog.remove()
                    });
                }
            });
        } catch (error) {
            console.error('Error in handleAddToPlan:', error);
        }
    }

    handleFavorite(btn) {
        btn.classList.toggle('active');
        
        // Add heart animation
        const heart = btn.querySelector('i');
        gsap.timeline()
            .to(heart, {
                scale: 1.5,
                duration: 0.15,
                ease: "back.out(1.7)"
            })
            .to(heart, {
                scale: 1,
                duration: 0.15,
                ease: "back.out(1.7)"
            });

        // Save to localStorage
        const recipeId = btn.closest('.recipe-card').dataset.recipeId;
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (btn.classList.contains('active')) {
            favorites.push(recipeId);
            this.showNotification('Added to favorites!');
        } else {
            const index = favorites.indexOf(recipeId);
            if (index > -1) {
                favorites.splice(index, 1);
            }
            this.showNotification('Removed from favorites');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites.forEach(recipeId => {
            const recipeCard = document.querySelector(`[data-recipe-id="${recipeId}"]`);
            if (recipeCard) {
                recipeCard.querySelector('.favorite-btn').classList.add('active');
            }
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
        }`;
        
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);

        // Animate in
        gsap.fromTo(notification,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3 }
        );

        // Remove after delay
        setTimeout(() => {
            gsap.to(notification, {
                y: 50,
                opacity: 0,
                duration: 0.3,
                onComplete: () => notification.remove()
            });
        }, 3000);
    }

    // Add this method to handle recipe data
    initializeRecipeData() {
        // Example recipe data structure
        const recipes = [
            {
                id: 1,
                title: "Mediterranean Salad",
                categories: ["vegetarian", "quick-meals"],
                time: "15 mins",
                calories: "320",
                image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe"
            },
            {
                id: 2,
                title: "Grilled Chicken & Vegetables",
                categories: ["low-carb", "quick-meals"],
                time: "30 mins",
                calories: "450",
                image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
            },
            // Add more recipes...
        ];

        // Store recipes data for later use
        this.recipes = recipes;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing RecipeApp');
    const app = new RecipeApp();
    window.recipeApp = app; // Make it accessible for debugging
}); 