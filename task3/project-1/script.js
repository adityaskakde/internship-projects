const STORAGE_KEY = 'crowdlaunch.projects';
const projectsGrid = document.getElementById('projects-grid');
const createForm = document.getElementById('create-project-form');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalContent = document.getElementById('modal-content');

function generateId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function loadProjects() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse stored projects', error);
    return [];
  }
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function getProjectStatus(project) {
  const now = new Date();
  const deadline = new Date(project.deadline);
  const raised = project.contributions.reduce((sum, item) => sum + item.amount, 0);

  if (raised >= project.goal) {
    return { label: 'Completed', style: 'active' };
  }

  if (deadline < now) {
    return { label: 'Ended', style: 'ended' };
  }

  return { label: 'Live', style: 'active' };
}

function getRaised(project) {
  return project.contributions.reduce((sum, item) => sum + item.amount, 0);
}

function getBackers(project) {
  return project.contributions.length;
}

function calculateProgress(project) {
  return Math.min(100, Math.round((getRaised(project) / project.goal) * 100));
}

function buildAmountCard(label, value) {
  return `
    <div class="amount-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function renderProjectCard(project) {
  const raised = getRaised(project);
  const progress = calculateProgress(project);
  const status = getProjectStatus(project);

  const card = document.createElement('article');
  card.className = 'project-card';
  card.innerHTML = `
    <header>
      <div>
        <h3>${project.title}</h3>
        <p class="project-description">${project.description}</p>
      </div>
      <span class="project-pill ${status.style}">${status.label}</span>
    </header>

    <div class="project-meta">
      <span>${project.category} • Deadline ${project.deadline}</span>
    </div>

    <div class="project-amounts">
      ${buildAmountCard('Goal', formatCurrency(project.goal))}
      ${buildAmountCard('Raised', formatCurrency(raised))}
      ${buildAmountCard('Backers', getBackers(project))}
    </div>

    <div class="progress-bar-wrap">
      <div class="progress-bar" style="width: ${progress}%"></div>
    </div>
    <p class="small-text">${progress}% of goal • ${project.updates.length} updates published</p>

    <div class="project-actions">
      <button class="button button-primary" data-action="support" data-id="${project.id}">Support campaign</button>
      <button class="button button-secondary" data-action="details" data-id="${project.id}">View details</button>
    </div>
  `;

  return card;
}

function renderProjects() {
  const projects = loadProjects();
  const filter = searchInput.value.trim().toLowerCase();
  const sortBy = sortSelect.value;

  const filtered = projects.filter((project) => {
    return (
      project.title.toLowerCase().includes(filter) ||
      project.description.toLowerCase().includes(filter) ||
      project.category.toLowerCase().includes(filter)
    );
  });

  const sorted = filtered.sort((a, b) => {
    if (sortBy === 'goal') {
      return b.goal - a.goal;
    }
    if (sortBy === 'raised') {
      return getRaised(b) - getRaised(a);
    }
    if (sortBy === 'ending') {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  projectsGrid.innerHTML = '';
  if (sorted.length === 0) {
    projectsGrid.innerHTML = `
      <div class="card">
        <h3>No campaigns found</h3>
        <p>Try creating a new campaign or adjust the search filter.</p>
      </div>
    `;
    return;
  }

  sorted.forEach((project) => {
    const card = renderProjectCard(project);
    projectsGrid.appendChild(card);
  });
}

function renderSupportModal(project) {
  const raised = getRaised(project);
  const remaining = Math.max(0, project.goal - raised);

  modalContent.innerHTML = `
    <h3>Support ${project.title}</h3>
    <p class="small-text">Funding goal: ${formatCurrency(project.goal)} • Raised so far: ${formatCurrency(raised)}</p>
    <div class="modal-summary">
      <span><span>Amount left to goal</span><strong>${formatCurrency(remaining)}</strong></span>
      <span><span>Backers</span><strong>${getBackers(project)}</strong></span>
      <span><span>Deadline</span><strong>${project.deadline}</strong></span>
    </div>

    <form id="payment-form" class="form-stack">
      <label>
        Your name
        <input type="text" name="donorName" placeholder="Maria, Alex, Team" required />
      </label>
      <label>
        Contribution amount
        <input type="number" name="amount" min="5" value="25" required />
      </label>
      <label>
        Payment method
        <select name="paymentType">
          <option>Card</option>
          <option>Bank transfer</option>
          <option>Wallet</option>
        </select>
      </label>
      <button class="button button-primary" type="submit">Complete contribution</button>
    </form>
  `;

  const paymentForm = document.getElementById('payment-form');
  paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(paymentForm);
    const donorName = formData.get('donorName').toString().trim() || 'Supporter';
    const amount = Number(formData.get('amount')) * 100;

    if (amount < 500) {
      alert('Minimum contribution is $5. Please enter a larger amount.');
      return;
    }

    completeContribution(project.id, donorName, amount);
  });
}

function renderDetailsModal(project) {
  const raised = getRaised(project);
  const progress = calculateProgress(project);

  modalContent.innerHTML = `
    <h3>${project.title}</h3>
    <p class="project-description">${project.description}</p>
    <div class="modal-summary">
      <span><span>Goal</span><strong>${formatCurrency(project.goal)}</strong></span>
      <span><span>Raised</span><strong>${formatCurrency(raised)}</strong></span>
      <span><span>Progress</span><strong>${progress}%</strong></span>
    </div>

    <div class="modal-grid">
      <div class="amount-card">
        <span>Campaign category</span>
        <strong>${project.category}</strong>
      </div>
      <div class="amount-card">
        <span>Deadline</span>
        <strong>${project.deadline}</strong>
      </div>
      <div class="amount-card">
        <span>Backers</span>
        <strong>${getBackers(project)}</strong>
      </div>
    </div>

    <section class="modal-updates">
      <h4>Updates</h4>
      ${project.updates.length === 0 ? '<p class="small-text">No updates yet.</p>' : ''}
      ${project.updates
        .slice()
        .reverse()
        .map(
          (update) => `
        <article class="update-item">
          <strong>${update.title}</strong>
          <p>${update.message}</p>
          <p class="small-text">Posted ${new Date(update.createdAt).toLocaleDateString()}</p>
        </article>
      `
        )
        .join('')}
    </section>
  `;
}

function openModal() {
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

function completeContribution(projectId, donorName, amount) {
  const projects = loadProjects();
  const project = projects.find((item) => item.id === projectId);
  if (!project) {
    alert('Could not find project for contribution.');
    return;
  }

  project.contributions.push({
    id: generateId(),
    donorName,
    amount,
    createdAt: new Date().toISOString(),
  });

  saveProjects(projects);
  closeModal();
  renderProjects();
  alert(`Contribution successful! ${donorName} added ${formatCurrency(amount)}.`);
}

function handleModalClick(event) {
  const target = event.target;
  if (target === modal || target.classList.contains('modal-backdrop')) {
    closeModal();
  }
}

function handleCardAction(event) {
  const button = event.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  const projectId = button.dataset.id;

  if (!action || !projectId) return;

  const projects = loadProjects();
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;

  if (action === 'support') {
    renderSupportModal(project);
    openModal();
  }

  if (action === 'details') {
    renderDetailsModal(project);
    openModal();
  }
}

createForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(createForm);
  const title = formData.get('title').toString().trim();
  const description = formData.get('description').toString().trim();
  const category = formData.get('category').toString();
  const deadline = formData.get('deadline').toString();
  const goal = Number(formData.get('goal')) * 100;

  if (!title || !description || !deadline || isNaN(goal) || goal < 10000) {
    alert('Please complete each field and set a funding goal of at least $100.');
    return;
  }

  const projects = loadProjects();
  projects.push({
    id: generateId(),
    title,
    description,
    category,
    deadline,
    goal,
    createdAt: new Date().toISOString(),
    contributions: [],
    updates: [
      {
        id: generateId(),
        title: 'Campaign created',
        message: 'Project launched and ready to collect contributions.',
        createdAt: new Date().toISOString(),
      },
    ],
  });

  saveProjects(projects);
  createForm.reset();
  renderProjects();
});

searchInput.addEventListener('input', renderProjects);
sortSelect.addEventListener('change', renderProjects);
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', handleModalClick);
projectsGrid.addEventListener('click', handleCardAction);

function init() {
  if (loadProjects().length === 0) {
    const exampleProjects = [
      {
        id: generateId(),
        title: 'EcoSmart Study Backpack',
        description: 'A smart backpack with solar charging and modular pockets for students and travelers.',
        category: 'Technology',
        deadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        goal: 600000,
        createdAt: new Date().toISOString(),
        contributions: [
          { id: generateId(), donorName: 'Ava', amount: 15000, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { id: generateId(), donorName: 'Noah', amount: 26000, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        updates: [
          { id: generateId(), title: 'Prototype ready', message: 'We finished the first working prototype and started testing battery life.', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      },
      {
        id: generateId(),
        title: 'Healthy Meals for Schools',
        description: 'Deliver nutritious fresh meals to schools and build a healthy lunch program for kids.',
        category: 'Health',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        goal: 480000,
        createdAt: new Date().toISOString(),
        contributions: [
          { id: generateId(), donorName: 'Emma', amount: 72000, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        updates: [],
      },
    ];
    saveProjects(exampleProjects);
  }

  renderProjects();
}

init();
