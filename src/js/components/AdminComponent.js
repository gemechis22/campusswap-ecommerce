/**
 * Admin Component
 * Handles admin dashboard UI and chart visualizations
 * Follows separation of concerns - only handles rendering
 */

import { formatCurrency, formatDate } from '../utils/helpers.js';

export class AdminComponent {
    constructor() {
        this.modal = null;
        this.charts = {};
    }

    /**
     * Show admin dashboard modal
     */
    async showDashboard(dashboardData, onLoadSales, onLoadInventory, onLoadUsers) {
        this.closeModal();

        this.modal = document.createElement('div');
        this.modal.className = 'admin-modal';
        this.modal.innerHTML = this.generateDashboardHTML(dashboardData);

        document.body.appendChild(this.modal);

        // Attach event listeners
        this.attachEventListeners(onLoadSales, onLoadInventory, onLoadUsers);

        // Initialize charts after DOM is ready
        setTimeout(() => this.initializeOverviewCharts(dashboardData), 100);
    }

    /**
     * Generate dashboard HTML
     */
    generateDashboardHTML(data) {
        const { stats, recentOrders } = data;

        return `
            <div class="modal-content admin-content">
                <div class="modal-header">
                    <h2>🛡️ Admin Dashboard</h2>
                    <button class="modal-close">✕</button>
                </div>
                
                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="overview">Overview</button>
                    <button class="admin-tab" data-tab="sales">Sales Reports</button>
                    <button class="admin-tab" data-tab="inventory">Inventory</button>
                    <button class="admin-tab" data-tab="users">Users</button>
                </div>
                
                <div class="admin-body">
                    <!-- Overview Panel -->
                    <div id="overview" class="admin-panel active">
                        ${this.generateOverviewPanel(stats, recentOrders)}
                    </div>
                    
                    <!-- Sales Panel -->
                    <div id="sales" class="admin-panel">
                        ${this.generateSalesPanel()}
                    </div>
                    
                    <!-- Inventory Panel -->
                    <div id="inventory" class="admin-panel">
                        ${this.generateInventoryPanel()}
                    </div>
                    
                    <!-- Users Panel -->
                    <div id="users" class="admin-panel">
                        ${this.generateUsersPanel()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate overview panel HTML
     */
    generateOverviewPanel(stats, recentOrders) {
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-value">${stats.totalUsers}</div>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-value">${stats.totalProducts}</div>
                    <div class="stat-label">Products Listed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🛒</div>
                    <div class="stat-value">${stats.totalOrders}</div>
                    <div class="stat-label">Total Orders</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value">${formatCurrency(stats.totalRevenue)}</div>
                    <div class="stat-label">Total Revenue</div>
                </div>
            </div>
            
            <div class="admin-section">
                <h3>Sales Overview</h3>
                <canvas id="overviewChart" width="400" height="150"></canvas>
            </div>
            
            <div class="admin-section">
                <h3>Recent Orders</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Buyer</th>
                            <th>Seller</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentOrders.map(order => `
                            <tr>
                                <td>${order.orderNumber}</td>
                                <td>${order.buyer.firstName} ${order.buyer.lastName}</td>
                                <td>${order.seller.firstName} ${order.seller.lastName}</td>
                                <td>${formatCurrency(order.totalAmount)}</td>
                                <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                                <td>${formatDate(order.createdAt)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Generate sales panel HTML
     */
    generateSalesPanel() {
        return `
            <div class="admin-section">
                <div class="section-header">
                    <h3>Sales Report</h3>
                    <div class="date-filters">
                        <input type="date" id="startDate" />
                        <input type="date" id="endDate" />
                        <button class="btn-primary btn-sm" id="generateSalesBtn">Generate</button>
                        <button class="btn-secondary btn-sm" id="exportSalesBtn">Export PDF</button>
                    </div>
                </div>
                <canvas id="salesChart" width="400" height="200"></canvas>
                <div id="salesSummary"></div>
            </div>
        `;
    }

    /**
     * Generate inventory panel HTML
     */
    generateInventoryPanel() {
        return `
            <div class="admin-section">
                <h3>Inventory Management</h3>
                <div id="inventoryStats"></div>
                <div id="inventoryTable">Loading...</div>
            </div>
        `;
    }

    /**
     * Generate users panel HTML
     */
    generateUsersPanel() {
        return `
            <div class="admin-section">
                <h3>User Management</h3>
                <div id="usersTable">Loading...</div>
            </div>
        `;
    }

    /**
     * Initialize overview charts
     */
    initializeOverviewCharts(data) {
        const canvas = document.getElementById('overviewChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if any
        if (this.charts.overview) {
            this.charts.overview.destroy();
        }

        // Create simple bar chart showing stats
        this.charts.overview = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Users', 'Products', 'Orders'],
                datasets: [{
                    label: 'Platform Statistics',
                    data: [
                        data.stats.totalUsers,
                        data.stats.totalProducts,
                        data.stats.totalOrders
                    ],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(227, 24, 55, 0.8)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(118, 75, 162, 1)',
                        'rgba(227, 24, 55, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Platform Activity Overview',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    /**
     * Render sales chart
     */
    renderSalesChart(salesData) {
        const canvas = document.getElementById('salesChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.sales) {
            this.charts.sales.destroy();
        }

        // Prepare data
        const labels = salesData.chartData.map(item => item.date);
        const revenue = salesData.chartData.map(item => item.revenue);
        const orders = salesData.chartData.map(item => item.orders);

        // Create chart
        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Revenue ($)',
                        data: revenue,
                        borderColor: 'rgba(227, 24, 55, 1)',
                        backgroundColor: 'rgba(227, 24, 55, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Orders',
                        data: orders,
                        borderColor: 'rgba(102, 126, 234, 1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Sales Performance Over Time',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.dataset.yAxisID === 'y') {
                                    label += '$' + context.parsed.y.toFixed(2);
                                } else {
                                    label += context.parsed.y;
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Revenue ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Number of Orders'
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });

        // Update summary
        this.renderSalesSummary(salesData.summary);
    }

    /**
     * Render sales summary
     */
    renderSalesSummary(summary) {
        const summaryDiv = document.getElementById('salesSummary');
        if (!summaryDiv) return;

        summaryDiv.innerHTML = `
            <div class="sales-summary">
                <p><strong>Total Orders:</strong> ${summary.totalOrders}</p>
                <p><strong>Total Revenue:</strong> ${formatCurrency(summary.totalRevenue)}</p>
                <p><strong>Average Order:</strong> ${formatCurrency(summary.averageOrderValue)}</p>
            </div>
        `;
    }

    /**
     * Render inventory table
     */
    renderInventory(inventoryData) {
        const statsDiv = document.getElementById('inventoryStats');
        const tableDiv = document.getElementById('inventoryTable');

        if (statsDiv) {
            statsDiv.innerHTML = `
                <div class="inventory-stats">
                    <p><strong>Low Stock Items:</strong> ${inventoryData.stats.lowStockCount}</p>
                    <p><strong>Out of Stock:</strong> ${inventoryData.stats.outOfStockCount}</p>
                    <p><strong>Total Inventory Value:</strong> ${formatCurrency(inventoryData.stats.totalValue)}</p>
                </div>
            `;
        }

        if (tableDiv) {
            tableDiv.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inventoryData.products.map(product => `
                            <tr class="${product.quantity < 5 ? 'low-stock' : ''}">
                                <td>${product.title}</td>
                                <td>${product.category?.name || 'N/A'}</td>
                                <td>${formatCurrency(product.price)}</td>
                                <td>
                                    <input type="number" 
                                           value="${product.quantity}" 
                                           min="0" 
                                           class="quantity-input"
                                           data-product-id="${product.id}"
                                           style="width: 60px; padding: 4px;" />
                                </td>
                                <td><span class="status-badge ${product.status === 'out-of-stock' ? 'status-cancelled' : 'status-completed'}">${product.status}</span></td>
                                <td>
                                    <button class="btn-primary btn-sm update-inventory-btn" data-product-id="${product.id}">
                                        Update
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    }

    /**
     * Render users table
     */
    renderUsers(usersData) {
        const tableDiv = document.getElementById('usersTable');
        if (!tableDiv) return;

        tableDiv.innerHTML = `
            <div class="inventory-stats" style="margin-bottom: 20px;">
                <p><strong>Total Users:</strong> ${usersData.stats.totalUsers}</p>
                <p><strong>Admin Users:</strong> ${usersData.stats.adminCount}</p>
                <p><strong>Regular Users:</strong> ${usersData.stats.regularCount}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Products Listed</th>
                        <th>Orders Made</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${usersData.users.map(user => `
                        <tr>
                            <td>${user.firstName} ${user.lastName}</td>
                            <td>${user.email}</td>
                            <td>${user.productCount}</td>
                            <td>${user.orderCount}</td>
                            <td><span class="status-badge ${user.isAdmin ? 'status-processing' : 'status-completed'}">${user.isAdmin ? 'Admin' : 'User'}</span></td>
                            <td>
                                <button class="btn-secondary btn-sm toggle-admin-btn" data-user-id="${user.id}">
                                    ${user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners(onLoadSales, onLoadInventory, onLoadUsers) {
        // Close button
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Tab switching
        const tabs = this.modal.querySelectorAll('.admin-tab');
        const panels = this.modal.querySelectorAll('.admin-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                tab.classList.add('active');
                const panel = this.modal.querySelector(`#${target}`);
                if (panel) panel.classList.add('active');

                // Load tab-specific data
                if (target === 'sales') {
                    // Sales data will be loaded by button click
                }
                if (target === 'inventory') onLoadInventory();
                if (target === 'users') onLoadUsers();
            });
        });

        // Sales report button
        const generateBtn = this.modal.querySelector('#generateSalesBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => onLoadSales());
        }

        // Export button
        const exportBtn = this.modal.querySelector('#exportSalesBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSalesReport());
        }
    }

    /**
     * Export sales report as PDF
     */
    exportSalesReport() {
        window.print();
    }

    /**
     * Close modal and cleanup charts
     */
    closeModal() {
        // Destroy all charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};

        // Remove modal
        if (this.modal && this.modal.parentElement) {
            this.modal.remove();
            this.modal = null;
        }
    }
}
