document.addEventListener("DOMContentLoaded", () => {
	// --- THEME AND STYLE SCRIPT ---
	const themeToggleBtn = document.getElementById("theme-toggle-btn");
	const sunIcon = document.getElementById("theme-toggle-sun-icon");
	const moonIcon = document.getElementById("theme-toggle-moon-icon");
	const directionalFlare = document.querySelector(".directional-flare");

	// Function to update the theme on the body and toggle icons
	const applyTheme = (theme) => {
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
			document.documentElement.classList.remove("light");
			document.body.classList.add("dark-theme");
			document.body.classList.remove("light-theme");
			sunIcon.classList.remove("hidden");
			moonIcon.classList.add("hidden");
		} else {
			document.documentElement.classList.remove("dark");
			document.documentElement.classList.add("light");
			document.body.classList.remove("dark-theme");
			document.body.classList.add("light-theme");
			sunIcon.classList.add("hidden");
			moonIcon.classList.remove("hidden");
		}
		renderAllCharts();
	};

	// Event listener for the theme toggle button
	themeToggleBtn.addEventListener("click", () => {
		const newTheme = document.documentElement.classList.contains("dark")
			? "light"
			: "dark";
		localStorage.setItem("theme", newTheme);
		applyTheme(newTheme);
	});

	// Mouse move listener for the interactive directional flare
	window.addEventListener("mousemove", (e) => {
		const { clientX, clientY } = e;
		// Make the flare visible and move it with the cursor
		directionalFlare.style.opacity = "1";
		directionalFlare.style.transform = `translate(${
			clientX - directionalFlare.offsetWidth / 2
		}px, ${clientY - directionalFlare.offsetHeight / 2}px)`;
	});

	// --- SETTINGS MENU SCRIPT ---
	const settingsBtn = document.getElementById("settings-btn");
	const settingsMenu = document.getElementById("settings-menu");

	settingsBtn.addEventListener("click", (e) => {
		e.stopPropagation(); // Prevent the click from closing the menu immediately
		settingsMenu.classList.toggle("hidden");
	});

	// Close the settings menu if clicking outside of it
	document.addEventListener("click", (e) => {
		if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
			settingsMenu.classList.add("hidden");
		}
	});

	// --- SIDEBAR AND ROUTING SCRIPT ---
	const sidebar = document.getElementById("sidebar");
	const mainContent = document.getElementById("main-content");
	const toggleMenuBtn = document.getElementById("toggle-menu-btn");
	// const closeMenuBtn = document.getElementById("close-menu");
	const overlay = document.getElementById("overlay");
	const sidebarNav = document.getElementById("sidebar-nav");

	const openSidebar = () => {
		sidebar.classList.remove("-translate-x-full");
		mainContent.classList.add("lg:ml-64");
		if (window.innerWidth < 1024) {
			overlay.classList.remove("hidden");
			document.body.classList.add("overflow-hidden");
		}
	};

	const closeSidebar = () => {
		sidebar.classList.add("-translate-x-full");
		mainContent.classList.remove("lg:ml-64");
		overlay.classList.add("hidden");
		document.body.classList.remove("overflow-hidden");
	};

	const toggleSidebar = () => {
		if (sidebar.classList.contains("-translate-x-full")) {
			openSidebar();
		} else {
			closeSidebar();
		}
	};

	if (window.innerWidth >= 1024) {
		openSidebar();
	} else {
		closeSidebar();
	}

	toggleMenuBtn.addEventListener("click", toggleSidebar);
	// closeMenuBtn.addEventListener("click", closeSidebar);
	overlay.addEventListener("click", closeSidebar);

	// --- HASH-BASED ROUTER ---
	const pageContainer = document.getElementById("page-container");
	const pages = pageContainer.querySelectorAll(".page-content");
	const navLinks = sidebarNav.querySelectorAll(".nav-link");

	const navigate = () => {
		const path = window.location.hash || "#/dashboard";
		pages.forEach((page) => page.classList.add("hidden"));
		const targetPageId = "page-" + path.substring(2);
		const targetPage = document.getElementById(targetPageId);
		if (targetPage) {
			targetPage.classList.remove("hidden");
		} else {
			document.getElementById("page-dashboard").classList.remove("hidden");
		}
		navLinks.forEach((link) => {
			if (link.getAttribute("href") === path) {
				link.classList.add(
					"bg-slate-200/80",
					"dark:bg-slate-700/50",
					"text-slate-900",
					"dark:text-slate-200",
					"font-medium"
				);
				link
					.querySelector("svg")
					.classList.add("text-indigo-500", "dark:text-indigo-400");
			} else {
				link.classList.remove(
					"bg-slate-200/80",
					"dark:bg-slate-700/50",
					"text-slate-900",
					"dark:text-slate-200",
					"font-medium"
				);
				link
					.querySelector("svg")
					.classList.remove("text-indigo-500", "dark:text-indigo-400");
			}
		});
		if (window.innerWidth < 1024) {
			closeSidebar();
		}
	};

	window.addEventListener("hashchange", navigate);

	// --- "QUICK LOOK" MODAL SCRIPT ---
	const modalOverlay = document.getElementById("quick-look-modal-overlay");
	const modal = document.getElementById("quick-look-modal");
	const modalCloseBtn = document.getElementById("modal-close-btn");
	const modalTitle = document.getElementById("modal-title");
	const modalContent = document.getElementById("modal-content");

	const openModal = () => {
		modal.classList.remove("hidden");
		modalOverlay.classList.remove("hidden");
	};

	const closeModal = () => {
		modal.classList.add("hidden");
		modalOverlay.classList.add("hidden");
		modalContent.innerHTML = ""; // Clear content to prevent old charts from showing
	};

	modalCloseBtn.addEventListener("click", closeModal);
	modalOverlay.addEventListener("click", closeModal);

	document.querySelectorAll(".quick-look-btn").forEach((button) => {
		button.addEventListener("click", (e) => {
			e.preventDefault();
			const target = e.target.dataset.target;
			populateModal(target);
			openModal();
		});
	});

	const populateModal = (target) => {
		let title = "Quick Look";
		let content = "";
		if (charts["modal-chart"]) charts["modal-chart"].destroy();

		switch (target) {
			case "agents":
				title = "Active Agents Details";
				const onlineAgents = agents.filter((a) => a.status !== "Offline");
				content = `<table class="w-full text-sm text-left">
                                <thead class="text-xs text-slate-500 dark:text-slate-400 uppercase bg-white/5 dark:bg-black/10"><tr>
                                    <th scope="col" class="px-6 py-3">Agent</th>
                                    <th scope="col" class="px-6 py-3">Customer</th>
                                    <th scope="col" class="px-6 py-3">Status</th>
                                </tr></thead><tbody>`;
				onlineAgents.forEach((agent) => {
					const customer = customers.find((c) => c.id === agent.customerId);
					content += `<tr class="border-b border-white/10 dark:border-white/10"><td class="px-6 py-4 text-slate-800 dark:text-slate-200">${
						agent.id
					}</td><td class="px-6 py-4 text-slate-500 dark:text-slate-400">${
						customer.name
					}</td><td class="px-6 py-4">${getStatusIndicator(agent.status)}</td></tr>`;
				});
				content += "</tbody></table>";
				break;
			case "processes":
				title = "Running Processes";
				content = `<ul class="space-y-2 text-sm">`;
				for (let i = 0; i < 10; i++) {
					content += `<li class="flex justify-between p-2 rounded-md glass-ui"><span class="text-slate-800 dark:text-slate-200">Process #${
						Math.floor(Math.random() * 9000) + 1000
					}</span><span class="text-slate-500 dark:text-slate-400">CPU: ${
						Math.floor(Math.random() * 20) + 5
					}%</span></li>`;
				}
				content += `</ul>`;
				break;
			case "gpu":
				title = "GPU Usage History (Last 60s)";
				content = `<div class="h-80"><canvas id="modal-gpu-chart"></canvas></div>`;
				break;
			case "availability":
				title = "System Availability Details";
				const { incidents, totalDowntime, uptimePercentage } = availabilityData;
				const downtimeMinutes = Math.floor(totalDowntime / 60);
				const downtimeSeconds = totalDowntime % 60;

				content = `
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                            <div><p class="text-sm text-slate-500 dark:text-slate-400">Uptime (24h)</p><p class="text-2xl font-bold text-green-500 dark:text-green-400">${uptimePercentage}%</p></div>
                            <div><p class="text-sm text-slate-500 dark:text-slate-400">Incidents (24h)</p><p class="text-2xl font-bold text-amber-500 dark:text-amber-400">${incidents.length}</p></div>
                            <div><p class="text-sm text-slate-500 dark:text-slate-400">Total Downtime</p><p class="text-2xl font-bold text-rose-500 dark:text-rose-400">${downtimeMinutes}m ${downtimeSeconds}s</p></div>
                        </div>
                        <h4 class="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Recent Incidents</h4>
                        <div class="overflow-y-auto h-48 border border-white/10 dark:border-white/10 rounded-lg">
                            <table class="w-full text-sm text-left">
                                <thead class="text-xs text-slate-500 dark:text-slate-400 uppercase bg-white/5 dark:bg-black/10 sticky top-0"><tr>
                                    <th class="px-4 py-2">Start Time</th><th class="px-4 py-2">End Time</th><th class="px-4 py-2">Duration</th>
                                </tr></thead>
                                <tbody id="modal-incident-log">`;
				incidents.forEach((incident) => {
					content += `<tr class="border-b border-white/10 dark:border-white/10"><td class="px-4 py-2">${incident.start.toLocaleTimeString()}</td><td class="px-4 py-2">${incident.end.toLocaleTimeString()}</td><td class="px-4 py-2">${
						incident.duration
					}s</td></tr>`;
				});
				content += `</tbody></table></div>
                    <h4 class="text-md font-semibold text-slate-700 dark:text-slate-300 mt-6 mb-2">24-Hour Overview</h4>
                    <div id="modal-availability-chart" class="grid grid-cols-12 md:grid-cols-24 gap-1 h-20"></div>`;
				break;
		}
		modalTitle.textContent = title;
		modalContent.innerHTML = content;

		// Re-render components that were just added to the DOM
		if (target === "gpu") {
			renderChartById("modal-gpu-chart", "line", {
				labels: Array.from({ length: 12 }, (_, i) => `${(11 - i) * 5}s ago`),
				datasets: [
					{
						label: "GPU",
						borderColor: "#fbbf24",
						tension: 0.3,
						data: Array.from({ length: 12 }, () =>
							Math.floor(Math.random() * 20 + 65)
						)
					}
				]
			});
		}
		if (target === "availability") {
			renderAvailabilityChart(
				"modal-availability-chart",
				availabilityData.hourlyStatus
			);
		}
	};

	// --- "CONTACT SALES" MODAL SCRIPT ---
	const signInBtn = document.getElementsByClassName("sign-in-btn");
	const contactModal = document.getElementById("contact-modal");
	const contactModalOverlay = document.getElementById("contact-modal-overlay");
	const contactModalCloseBtn = document.getElementById(
		"contact-modal-close-btn"
	);

	const openContactModal = () => {
		contactModal.classList.remove("hidden");
		contactModalOverlay.classList.remove("hidden");
	};

	const closeContactModal = () => {
		contactModal.classList.add("hidden");
		contactModalOverlay.classList.add("hidden");
	};

	console.log(Object.prototype.toString.call(signInBtn));
	// signInBtn.addEventListener("click", openContactModal);
	[...signInBtn].forEach((btn) =>
		btn.addEventListener("click", openContactModal)
	);
	contactModalCloseBtn.addEventListener("click", closeContactModal);
	contactModalOverlay.addEventListener("click", closeContactModal);

	// --- DATA SIMULATION SCRIPT ---

	const agents = [
		{
			id: "agent-001",
			customerId: 1,
			status: "Online",
			task: "Data Ingestion"
		},
		{
			id: "agent-002",
			customerId: 2,
			status: "Online",
			task: "Model Training"
		},
		{
			id: "agent-003",
			customerId: 3,
			status: "Error",
			task: "API Call Failed"
		},
		{
			id: "agent-004",
			customerId: 4,
			status: "Online",
			task: "Image Recognition"
		},
		{ id: "agent-005", customerId: 1, status: "Offline", task: "Idle" },
		{
			id: "agent-006",
			customerId: 5,
			status: "Online",
			task: "Sentiment Analysis"
		},
		{
			id: "agent-007",
			customerId: 2,
			status: "Warning",
			task: "High Latency"
		}
	];

	const customers = [
		{ id: 1, name: "QuantumLeap Inc.", status: "Active" },
		{ id: 2, name: "CyberSynth Corp.", status: "Active" },
		{ id: 3, name: "BioGen Futures", status: "Warning" },
		{ id: 4, name: "StellarNav", status: "Active" },
		{ id: 5, name: "NovaDrive", status: "Active" },
		{ id: 6, name: "NovaDrive", status: "Active" },
		{ id: 7, name: "NovaDrive", status: "Active" }
	];

	let availabilityData = {};
	let charts = {};

	// --- UTILITY FUNCTIONS ---
	const getStatusIndicator = (status) => {
		const colors = {
			Online: "bg-green-500",
			Active: "bg-green-500",
			Offline: "bg-slate-500",
			Error: "bg-rose-500",
			Warning: "bg-amber-500"
		};
		const color = colors[status] || "bg-slate-500";
		return `<div class="flex items-center"><div class="h-2.5 w-2.5 rounded-full ${color} mr-2"></div> ${status}</div>`;
	};

	const generateResourceUsage = (status) => {
		if (status === "Offline") return { gpu: 0, cpu: 0, ram: 0 };
		if (status === "Error") return { gpu: 5, cpu: 5, ram: 10 };
		return {
			gpu: Math.floor(Math.random() * 80) + 15,
			cpu: Math.floor(Math.random() * 70) + 10,
			ram: Math.floor(Math.random() * 60) + 20
		};
	};

	const generateAvailabilityData = () => {
		const now = Date.now();
		let incidents = [];
		let hourlyStatus = [];
		let totalDowntime = 0;
		for (let i = 0; i < 24; i++) {
			if (Math.random() > 0.85) {
				const duration = Math.floor(Math.random() * 120) + 30;
				const end = new Date(now - i * 3600 * 1000 - Math.random() * 3000 * 1000);
				const start = new Date(end.getTime() - duration * 1000);
				incidents.push({ start, end, duration });
				totalDowntime += duration;
				hourlyStatus.push(false);
			} else {
				hourlyStatus.push(true);
			}
		}
		const uptimePercentage = (
			((24 * 3600 - totalDowntime) / (24 * 3600)) *
			100
		).toFixed(2);
		availabilityData = {
			incidents,
			totalDowntime,
			uptimePercentage,
			hourlyStatus: hourlyStatus.reverse()
		};
	};

	// --- RENDER FUNCTIONS ---
	const renderAgentTables = () => {
		const summaryTable = document.getElementById("agent-status-table-summary");
		const detailsTable = document.getElementById("agent-status-table-details");
		if (summaryTable) summaryTable.innerHTML = "";
		if (detailsTable) detailsTable.innerHTML = "";

		agents.forEach((agent) => {
			const resources = generateResourceUsage(agent.status);
			const customer = customers.find((c) => c.id === agent.customerId);
			if (summaryTable) {
				const summaryRow = document.createElement("tr");
				// `last:border-b-0` to remove the border from the final row.
				summaryRow.className =
					"border-b border-white/10 dark:border-white/10 hover:bg-white/5 dark:hover:bg-black/10 last:border-b-0";
				summaryRow.innerHTML = `<td class="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">${
					agent.id
				}</td><td class="px-6 py-4 text-slate-600 dark:text-slate-300">${getStatusIndicator(
					agent.status
				)}</td><td class="px-6 py-4 text-slate-500 dark:text-slate-400"><div class="flex items-center space-x-2 text-xs"><span>G:${
					resources.gpu
				}%</span><span>C:${resources.cpu}%</span><span>R:${
					resources.ram
				}%</span></div></td>`;
				summaryTable.appendChild(summaryRow);
			}
			if (detailsTable) {
				const detailsRow = document.createElement("tr");
				// `last:border-b-0` to remove the border from the final row.
				detailsRow.className =
					"border-b border-white/10 dark:border-white/10 hover:bg-white/5 dark:hover:bg-black/10 last:border-b-0";
				detailsRow.innerHTML = `<td class="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">${
					agent.id
				}</td><td class="px-6 py-4 text-slate-500 dark:text-slate-400">${
					customer.name
				}</td><td class="px-6 py-4 text-slate-600 dark:text-slate-300">${getStatusIndicator(
					agent.status
				)}</td><td class="px-6 py-4 text-slate-500 dark:text-slate-400"><div class="flex items-center space-x-2 text-xs"><span>G:${
					resources.gpu
				}%</span><span>C:${resources.cpu}%</span><span>R:${
					resources.ram
				}%</span></div></td><td class="px-6 py-4"><button class="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium">Details</button></td>`;
				detailsTable.appendChild(detailsRow);
			}
		});
	};

	const renderCustomerTable = () => {
		const tableBody = document.getElementById("customer-list-table");
		if (!tableBody) return;
		tableBody.innerHTML = "";
		customers.forEach((customer) => {
			const activeAgents = agents.filter(
				(a) => a.customerId === customer.id && a.status !== "Offline"
			).length;
			const row = document.createElement("tr");
			// `last:border-b-0` to remove the border from the final row.
			row.className =
				"border-b border-white/10 dark:border-white/10 hover:bg-white/5 dark:hover:bg-black/10 last:border-b-0";
			row.innerHTML = `<td class="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">${
				customer.name
			}</td><td class="px-6 py-4 text-slate-500 dark:text-slate-400">${activeAgents}</td><td class="px-6 py-4 text-slate-600 dark:text-slate-300">${getStatusIndicator(
				customer.status,
				"customer"
			)}</td><td class="px-6 py-4"><button class="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium">View</button></td>`;
			tableBody.appendChild(row);
		});
	};

	const renderLogs = () => {
		const agentLog = document.getElementById("agent-activity-log");
		const systemLog = document.getElementById("system-events-log");
		if (agentLog) {
			agentLog.innerHTML = "";
			for (let i = 0; i < 15; i++) {
				const agent = agents[Math.floor(Math.random() * agents.length)];
				const actions = [
					"Task Started",
					"Task Completed",
					"API Call",
					"Data Processed",
					"Status Changed"
				];
				const action = actions[Math.floor(Math.random() * actions.length)];
				const row = document.createElement("tr");
				row.className = "border-b border-white/10 dark:border-white/10";
				row.innerHTML = `<td class="px-6 py-3 text-slate-500 dark:text-slate-400">${new Date(
					Date.now() - i * 60000
				).toLocaleTimeString()}</td><td class="px-6 py-3 text-slate-700 dark:text-slate-300">${
					agent.id
				}</td><td class="px-6 py-3 text-slate-500 dark:text-slate-400">${action}</td>`;
				agentLog.appendChild(row);
			}
		}
		if (systemLog) {
			systemLog.innerHTML = "";
			const levels = [
				{ name: "INFO", color: "text-cyan-500 dark:text-cyan-400" },
				{ name: "WARN", color: "text-amber-500 dark:text-amber-400" },
				{ name: "ERROR", color: "text-rose-500 dark:text-rose-400" }
			];
			const events = [
				"CPU usage > 90%",
				"New agent deployed",
				"System backup completed",
				"GPU driver updated",
				"Network latency high"
			];
			for (let i = 0; i < 15; i++) {
				const level = levels[Math.floor(Math.random() * levels.length)];
				const event = events[Math.floor(Math.random() * events.length)];
				const row = document.createElement("tr");
				row.className = "border-b border-white/10 dark:border-white/10";
				row.innerHTML = `<td class="px-6 py-3 text-slate-500 dark:text-slate-400">${new Date(
					Date.now() - i * 90000
				).toLocaleTimeString()}</td><td class="px-6 py-3 font-medium ${
					level.color
				}">${
					level.name
				}</td><td class="px-6 py-3 text-slate-500 dark:text-slate-400">${event}</td>`;
				systemLog.appendChild(row);
			}
		}
	};

	const renderChartById = (id, type, data, options = {}) => {
		const ctx = document.getElementById(id);
		if (ctx) {
			const chartId = id.startsWith("modal") ? "modal-chart" : id;
			if (charts[chartId]) charts[chartId].destroy();

			// Function to get theme-dependent chart options.
			const getChartOptions = () => {
				const isDarkMode = document.documentElement.classList.contains("dark");
				return {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: false,
							position: "bottom",
							labels: { color: isDarkMode ? "#94a3b8" : "#475569" }
						}
					},
					scales: {
						y: {
							beginAtZero: true,
							grid: {
								color: isDarkMode ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.7)"
							},
							ticks: { color: isDarkMode ? "#94a3b8" : "#64748b" }
						},
						x: {
							grid: {
								color: isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(241, 245, 249, 0.7)"
							},
							ticks: { color: isDarkMode ? "#94a3b8" : "#64748b" }
						}
					}
				};
			};
			const finalOptions = { ...getChartOptions(), ...options };
			// Override legend options if they are passed in explicitly
			if (options.plugins && options.plugins.legend) {
				finalOptions.plugins.legend = {
					...finalOptions.plugins.legend,
					...options.plugins.legend
				};
			}
			// Override scale options if passed
			if (options.scales) {
				finalOptions.scales = {
					...finalOptions.scales,
					...options.scales
				};
			}

			charts[chartId] = new Chart(ctx, {
				type,
				data,
				options: finalOptions
			});
		}
	};

	const renderAllCharts = () => {
		renderChartById("tasks-chart", "bar", {
			labels: ["-4h", "-3h", "-2h", "-1h", "Now"],
			datasets: [
				{
					label: "Tasks",
					backgroundColor: "#6366f1",
					data: [50, 65, 70, 85, 95]
				}
			]
		});
		renderChartById(
			"latency-chart",
			"line",
			{
				labels: ["-4h", "-3h", "-2h", "-1h", "Now"],
				datasets: [
					{
						label: "Latency",
						borderColor: "#22d3ee",
						tension: 0.3,
						data: [120, 110, 150, 130, 125]
					}
				]
			},
			{ scales: { y: { beginAtZero: false } } }
		);
		renderChartById(
			"customer-agents-chart",
			"doughnut",
			{
				labels: customers.map((c) => c.name),
				datasets: [
					{
						label: "Agents",
						backgroundColor: ["#818cf8", "#67e8f9", "#f87171", "#fbbf24", "#a78bfa"],
						data: customers.map(
							(c) => agents.filter((a) => a.customerId === c.id).length
						),
						borderWidth: 0
					}
				]
			},
			{
				plugins: { legend: { display: true, position: "bottom" } }
			}
		);
		renderChartById(
			"resource-history-chart",
			"line",
			{
				labels: Array.from({ length: 10 }, (_, i) => `${(9 - i) * 5}s ago`),
				datasets: [
					{
						label: "GPU",
						borderColor: "#fbbf24",
						tension: 0.3,
						data: Array.from({ length: 10 }, () =>
							Math.floor(Math.random() * 20 + 65)
						)
					},
					{
						label: "CPU",
						borderColor: "#67e8f9",
						tension: 0.3,
						data: Array.from({ length: 10 }, () =>
							Math.floor(Math.random() * 20 + 40)
						)
					}
				]
			},
			{
				plugins: { legend: { display: true, position: "top" } },
				scales: { y: { max: 100 } }
			}
		);
	};

	const renderDashboardAvailabilityDetails = () => {
		const {
			incidents,
			totalDowntime,
			uptimePercentage,
			hourlyStatus
		} = availabilityData;
		const downtimeMinutes = Math.floor(totalDowntime / 60);
		const downtimeSeconds = totalDowntime % 60;

		document.getElementById(
			"dashboard-uptime"
		).textContent = `${uptimePercentage}%`;
		document.getElementById("dashboard-incidents").textContent = incidents.length;
		document.getElementById(
			"dashboard-downtime"
		).textContent = `${downtimeMinutes}m ${downtimeSeconds}s`;

		const logBody = document.getElementById("dashboard-incident-log");
		logBody.innerHTML = "";
		// Show top 3 incidents
		incidents.slice(0, 3).forEach((incident) => {
			logBody.innerHTML += `<tr class="border-b border-white/10 dark:border-white/10"><td class="px-2 py-1">${incident.start.toLocaleTimeString()}</td><td class="px-2 py-1">${
				incident.duration
			}s</td></tr>`;
		});
		renderAvailabilityChart("availability-chart-dashboard", hourlyStatus);
	};

	const updateAllMetrics = () => {
		const onlineAgents = agents.filter(
			(a) => a.status === "Online" || a.status === "Warning"
		).length;
		const totalGpu = Math.floor(Math.random() * 20 + 65);
		const updateEl = (id, value, isWidth = false) => {
			const el = document.getElementById(id);
			if (el) {
				if (isWidth) el.style.width = value;
				else el.textContent = value;
			}
		};
		updateEl("active-agents", `${onlineAgents}/${agents.length}`);
		updateEl("processes-running", Math.floor(Math.random() * 50 + 100));
		updateEl("gpu-usage", `${totalGpu}%`);
		updateEl("system-availability", `${availabilityData.uptimePercentage}%`);
		updateEl("gpu-mem-percent", `${Math.floor(Math.random() * 30 + 40)}%`);
		updateEl(
			"gpu-mem-bar",
			document.getElementById("gpu-mem-percent")?.textContent,
			true
		);
		updateEl("net-io-percent", `${Math.floor(Math.random() * 50 + 10)}%`);
		updateEl(
			"net-io-bar",
			document.getElementById("net-io-percent")?.textContent,
			true
		);
		updateEl("disk-percent", `${Math.floor(Math.random() * 10 + 60)}%`);
		updateEl(
			"disk-bar",
			document.getElementById("disk-percent")?.textContent,
			true
		);
		updateEl("availability-percent", "99.98%");
		updateEl("availability-bar", "99.98%", true);
	};

	const renderAvailabilityChart = (chartId, statusData = []) => {
		const chartContainer = document.getElementById(chartId);
		if (!chartContainer) return;
		chartContainer.innerHTML = "";
		statusData.forEach((isUp) => {
			const bar = document.createElement("div");
			bar.className = `rounded ${isUp ? "bg-green-500" : "bg-rose-500"}`;
			chartContainer.appendChild(bar);
		});
	};

	// --- INITIALIZATION AND INTERVALS ---
	const initialRender = () => {
		const currentTheme =
			localStorage.getItem("theme") ||
			(window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light");
		applyTheme(currentTheme);

		generateAvailabilityData();
		renderAgentTables();
		renderCustomerTable();
		renderLogs();
		updateAllMetrics();
		renderDashboardAvailabilityDetails();
	};

	navigate();
	initialRender();

	setInterval(() => {
		renderAgentTables();
		renderLogs();
	}, 5000);
	setInterval(() => {
		generateAvailabilityData();
		updateAllMetrics();
		renderDashboardAvailabilityDetails();
		if (charts["resource-history-chart"]) {
			const chart = charts["resource-history-chart"];
			chart.data.datasets[0].data.shift();
			chart.data.datasets[0].data.push(Math.floor(Math.random() * 20 + 65));
			chart.data.datasets[1].data.shift();
			chart.data.datasets[1].data.push(Math.floor(Math.random() * 20 + 40));
			chart.update("quiet");
		}
	}, 2500);
});
