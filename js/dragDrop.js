console.log('dragDrop.js loaded');

class DragDropHandler {
    constructor() {
        this.initializeMealPlanner();
        this.initializeDragDrop();
        this.initializeClearAll();
    }

    initializeMealPlanner() {
        console.log('Initializing meal planner');
        const daysGrid = document.querySelector('.days-grid');
        
        if (!daysGrid) {
            console.error('Days grid not found');
            return;
        }
        
        const days = [
            { name: 'Monday', icon: 'fa-moon' },
            { name: 'Tuesday', icon: 'fa-cloud' },
            { name: 'Wednesday', icon: 'fa-sun' },
            { name: 'Thursday', icon: 'fa-star' },
            { name: 'Friday', icon: 'fa-heart' },
            { name: 'Saturday', icon: 'fa-music' },
            { name: 'Sunday', icon: 'fa-coffee' }
        ];
        
        days.forEach(day => {
            console.log('Adding slot for:', day.name);
            const daySlot = document.createElement('div');
            daySlot.className = 'day-slot bg-gray-50 rounded-lg p-4';
            daySlot.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-gray-900 flex items-center">
                        <i class="fas ${day.icon} mr-2 text-custom"></i>
                        ${day.name}
                    </h3>
                    <span class="text-xs text-gray-500 meal-count">0 meals</span>
                </div>
                <div class="meal-slot bg-white rounded-lg p-3 h-32 border-2 border-dashed border-gray-200 flex items-center justify-center transition-all hover:border-custom hover:bg-gray-50" data-day="${day.name}">
                    <div class="text-center">
                        <i class="fas fa-utensils text-gray-400 mb-2 text-xl"></i>
                        <span class="text-sm text-gray-500 block">Drop meal here</span>
                    </div>
                </div>
            `;
            daysGrid.appendChild(daySlot);
        });
    }

    initializeDragDrop() {
        document.addEventListener('dragover', (e) => e.preventDefault());
        
        const setupDraggableRecipes = () => {
            const recipeCards = document.querySelectorAll('.recipe-card');
            recipeCards.forEach(card => {
                if (!card.hasAttribute('draggable')) {
                    card.setAttribute('draggable', true);
                    this.setupDragListeners(card);
                }
            });
        };

        // Initial setup
        setupDraggableRecipes();

        // Setup observer for dynamically added recipe cards
        const observer = new MutationObserver(setupDraggableRecipes);
        observer.observe(document.querySelector('.recipe-grid'), {
            childList: true,
            subtree: true
        });
    }

    setupDragListeners(card) {
        card.addEventListener('dragstart', (e) => {
            console.log('Drag started');
            e.dataTransfer.setData('text/plain', card.dataset.recipeId);
            card.classList.add('opacity-50');
            
            // Create drag preview
            const preview = card.cloneNode(true);
            preview.style.width = '200px';
            preview.style.position = 'absolute';
            preview.style.top = '-1000px';
            document.body.appendChild(preview);
            e.dataTransfer.setDragImage(preview, 100, 100);
            setTimeout(() => preview.remove(), 0);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('opacity-50');
        });
    }

    addMealToSlot(slot, recipe) {
        // Clear existing content
        slot.innerHTML = '';
        slot.style.borderStyle = 'solid';
        slot.style.borderColor = 'var(--custom)';
        
        // Create meal preview
        const preview = document.createElement('div');
        preview.className = 'meal-preview relative';
        
        const img = recipe.querySelector('img').cloneNode(true);
        const title = recipe.querySelector('h3').textContent;
        
        preview.innerHTML = `
            <div class="relative group">
                <img src="${img.src}" alt="${title}" class="w-full h-24 object-cover rounded-lg">
                <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                <button class="remove-meal absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 shadow-md hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                    <i class="fas fa-times text-sm"></i>
                </button>
            </div>
            <p class="text-sm font-medium mt-2 text-center text-gray-900 line-clamp-1">${title}</p>
        `;
        
        slot.appendChild(preview);
        
        // Update meal count
        const daySlot = slot.closest('.day-slot');
        const mealCount = daySlot.querySelector('.meal-count');
        const count = daySlot.querySelectorAll('.meal-preview').length;
        mealCount.textContent = `${count} meal${count !== 1 ? 's' : ''}`;
        
        // Add remove functionality
        preview.querySelector('.remove-meal').addEventListener('click', () => {
            gsap.to(preview, {
                scale: 0.8,
                opacity: 0,
                duration: 0.2,
                onComplete: () => {
                    this.clearSlot(slot);
                    // Update meal count
                    const count = daySlot.querySelectorAll('.meal-preview').length;
                    mealCount.textContent = `${count} meal${count !== 1 ? 's' : ''}`;
                }
            });
        });

        // Add animation
        gsap.from(preview, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    }

    clearSlot(slot) {
        slot.style.borderStyle = 'dashed';
        slot.style.borderColor = '#E5E7EB';
        slot.innerHTML = `
            <div class="text-center">
                <i class="fas fa-utensils text-gray-400 mb-2 text-xl"></i>
                <span class="text-sm text-gray-500 block">Drop meal here</span>
            </div>
        `;
    }

    initializeClearAll() {
        const clearAllBtn = document.querySelector('.clear-all-btn');
        clearAllBtn?.addEventListener('click', () => {
            document.querySelectorAll('.meal-slot').forEach(slot => {
                this.clearSlot(slot);
            });
            // Dispatch notification event
            document.dispatchEvent(new CustomEvent('showNotification', {
                detail: { message: 'All meals cleared!' }
            }));
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new DragDropHandler();
}); 