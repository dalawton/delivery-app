const fs = require('fs');
const path = require('path');

const INDEX_HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

describe('index.html structure', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = INDEX_HTML;
  });

  test('has auth screen and main app containers', () => {
    expect(document.getElementById('authScreen')).not.toBeNull();
    expect(document.getElementById('mainApp')).not.toBeNull();
  });

  test('has cart and checkout elements', () => {
    expect(document.getElementById('cartBtn')).not.toBeNull();
    expect(document.getElementById('cartSidebar')).not.toBeNull();
    expect(document.getElementById('checkoutModal')).not.toBeNull();
  });

  test('has restaurant detail and menu containers', () => {
    expect(document.getElementById('restaurantDetailSection')).not.toBeNull();
    expect(document.getElementById('menuItemsContainer')).not.toBeNull();
  });
});
