export const BIRTHDAY_PROJECT = {
  id: 'birthday',
  title: "Charlie's First Birthday Party",
  description: "Planning a magical first birthday celebration for little Charlie — from venue to cake to decorations. Explore all the features Draft2Done has to offer using this sample project.",
  status: 'In Progress',
  image: '/demo/charlie-party-setup.png',
  tasks: [
    { id: 't1', title: 'Book the venue', completed: true, category: 'Planning', difficulty: 'Beginner', estimatedTime: '', description: 'Scout local community halls and garden spaces', order: 0, assignee: 'sarah@party.com' },
    { id: 't2', title: 'Send invitations', completed: true, category: 'Planning', difficulty: 'Beginner', estimatedTime: '', description: '', order: 1, assignee: 'mike@party.com' },
    { id: 't3', title: 'Order birthday cake', completed: false, category: 'Planning', difficulty: 'Beginner', estimatedTime: '', description: 'Smash cake for Charlie + main cake for guests', order: 2, assignee: 'sarah@party.com' },
    { id: 't4', title: 'Buy balloon arch supplies', completed: false, category: 'Shopping', difficulty: 'Beginner', estimatedTime: '', description: '', order: 3, assignee: 'james@party.com' },
    { id: 't5', title: 'Arrange finger foods and snacks', completed: false, category: 'Planning', difficulty: 'Intermediate', estimatedTime: '', description: '', order: 4, assignee: 'mike@party.com' },
    { id: 't6', title: 'Set up photo booth corner', completed: false, category: 'Setup', difficulty: 'Beginner', estimatedTime: '', description: '', order: 5, assignee: 'james@party.com' },
  ],
  materials: [
    { id: 'm1', name: 'Balloon pack (sage green & peach)', quantity: '3 packs', size: '', purchased: true, shoppingLink: 'https://www.amazon.com/s?k=sage+green+peach+party+balloons', notes: '' },
    { id: 'm2', name: 'Happy Birthday banner', quantity: '1', size: "4' x 6'", purchased: true, shoppingLink: '', notes: '' },
    { id: 'm3', name: 'Paper plates & cups (woodland animals theme)', quantity: '20 sets', size: '', purchased: false, shoppingLink: 'https://www.etsy.com/search?q=woodland+animals+birthday+paper+plates+cups', notes: '' },
    { id: 'm4', name: 'Confetti & table scatter', quantity: '2 bags', size: '', purchased: false, shoppingLink: '', notes: '' },
    { id: 'm5', name: 'Number 1 candle', quantity: '2', size: '', purchased: false, shoppingLink: 'https://www.amazon.com/s?k=number+1+first+birthday+candle', notes: '' },
  ],
  references: [
    { id: 'r1', title: 'Birthday Party Game Ideas', url: 'https://www.wikihow.com/Birthday-Games', description: 'Fun game ideas to keep little ones entertained', sourceType: 'website', addedDate: '2025-01-15T10:00:00Z' },
    { id: 'r2', title: 'DIY Balloon Arch Tutorial', url: 'https://www.youtube.com/results?search_query=diy+balloon+arch+tutorial', description: 'Easy balloon garland ideas for beginners', sourceType: 'youtube', addedDate: '2025-01-15T10:00:00Z' },
    { id: 'r3', title: 'First Birthday Smash Cake Ideas', url: 'https://www.pinterest.com/search/pins/?q=first+birthday+smash+cake', description: 'Smash cake design inspiration', sourceType: 'pinterest', addedDate: '2025-01-15T10:00:00Z' },
  ],
  pictures: [
    { id: 'p1', url: '/demo/charlie-cake-animals.png', key: null, caption: '', type: 'design', order: 0 },
    { id: 'p2', url: '/demo/charlie-party-animals.png', key: null, caption: '', type: 'progress', order: 1 },
    { id: 'p3', url: '/demo/charlie-berry-cake.png', key: null, caption: '', type: 'design', order: 2 },
    { id: 'p4', url: '/demo/charlie-invitation.png', key: null, caption: '', type: 'progress', order: 3 },
    { id: 'p5', url: '/demo/charlie-party-setup.png', key: null, caption: '', type: 'progress', order: 4 },
    { id: 'p6', url: '/demo/charlie-decor.png', key: null, caption: '', type: 'design', order: 5 },
  ],
  role: 'owner',
  ownerEmail: 'demo@draft2done.com',
  createdDate: '2025-01-15T10:00:00Z',
  collaborators: [
    { email: 'sarah@party.com', permission: 'edit' },
    { email: 'mike@party.com', permission: 'edit' },
    { email: 'james@party.com', permission: 'view' },
  ],
}

export const PATIO_PROJECT = {
  id: 'patio',
  title: 'Backyard Patio Remodel',
  description: "Transforming an existing basic patio into a beautiful outdoor living space — covered pergola, outdoor kitchen, Edison string lights and lush tropical greenery.",
  status: 'In Progress',
  image: '/demo/patio-living.png',
  tasks: [
    { id: 'pt1', title: 'Measure patio and plan new zones', completed: true, category: 'Planning', difficulty: 'Beginner', estimatedTime: '', description: 'Define living area, kitchen zone and dining space', order: 0, assignee: 'alex@patio.com' },
    { id: 'pt2', title: 'Choose colour palette and materials', completed: true, category: 'Planning', difficulty: 'Beginner', estimatedTime: '', description: '', order: 1, assignee: 'jordan@patio.com' },
    { id: 'pt3', title: 'Power wash existing patio surface', completed: true, category: 'Setup', difficulty: 'Beginner', estimatedTime: '', description: '', order: 2, assignee: 'sam@patio.com' },
    { id: 'pt4', title: 'Seal and refinish existing concrete', completed: false, category: 'Setup', difficulty: 'Intermediate', estimatedTime: '', description: '', order: 3, assignee: 'alex@patio.com' },
    { id: 'pt5', title: 'Install modular outdoor kitchen unit', completed: false, category: 'Setup', difficulty: 'Advanced', estimatedTime: '', description: '', order: 4, assignee: 'jordan@patio.com' },
    { id: 'pt6', title: 'Tile blue zellige backsplash', completed: false, category: 'Setup', difficulty: 'Intermediate', estimatedTime: '', description: '', order: 5, assignee: 'alex@patio.com' },
    { id: 'pt7', title: 'Connect outdoor sink to water line', completed: false, category: 'Setup', difficulty: 'Advanced', estimatedTime: '', description: '', order: 6, assignee: 'jordan@patio.com' },
    { id: 'pt8', title: 'Install outdoor-rated beverage fridge', completed: false, category: 'Setup', difficulty: 'Beginner', estimatedTime: '', description: '', order: 7, assignee: 'sam@patio.com' },
    { id: 'pt9', title: 'Mount ceiling fan on existing pergola', completed: false, category: 'Setup', difficulty: 'Intermediate', estimatedTime: '', description: '', order: 8, assignee: 'jordan@patio.com' },
    { id: 'pt10', title: 'Hang Edison string lights across patio', completed: false, category: 'Setup', difficulty: 'Beginner', estimatedTime: '', description: '', order: 9, assignee: 'sam@patio.com' },
    { id: 'pt11', title: 'Build wood trellis for climbing plants', completed: false, category: 'Setup', difficulty: 'Intermediate', estimatedTime: '', description: '', order: 10, assignee: 'alex@patio.com' },
    { id: 'pt12', title: 'Add potted palms and tropical greenery', completed: false, category: 'Shopping', difficulty: 'Beginner', estimatedTime: '', description: '', order: 11, assignee: 'sam@patio.com' },
    { id: 'pt13', title: 'Replace old furniture with teak outdoor set', completed: false, category: 'Shopping', difficulty: 'Beginner', estimatedTime: '', description: '', order: 12, assignee: 'sam@patio.com' },
    { id: 'pt14', title: 'Add outdoor rug and throw cushions', completed: false, category: 'Shopping', difficulty: 'Beginner', estimatedTime: '', description: '', order: 13, assignee: 'jordan@patio.com' },
    { id: 'pt15', title: 'Style decor, planters and finishing touches', completed: false, category: 'Setup', difficulty: 'Beginner', estimatedTime: '', description: '', order: 14, assignee: 'alex@patio.com' },
  ],
  materials: [
    { id: 'pm1', name: 'Concrete patio sealant', quantity: '2 gallons', size: '', purchased: true, shoppingLink: 'https://www.homedepot.com/s/concrete+patio+sealant', notes: '' },
    { id: 'pm2', name: 'Outdoor Edison string lights (48ft)', quantity: '2 sets', size: '', purchased: true, shoppingLink: 'https://www.amazon.com/s?k=outdoor+edison+string+lights+48ft', notes: '' },
    { id: 'pm3', name: 'Blue zellige wall tiles', quantity: '15 sq ft', size: '4"x4"', purchased: false, shoppingLink: 'https://www.etsy.com/search?q=blue+zellige+tiles+outdoor+kitchen', notes: '' },
    { id: 'pm4', name: 'Built-in outdoor grill (stainless)', quantity: '1', size: '30"', purchased: false, shoppingLink: 'https://www.amazon.com/s?k=built+in+outdoor+grill+stainless+steel', notes: '' },
    { id: 'pm5', name: 'Teak outdoor furniture set', quantity: '1 set', size: '', purchased: false, shoppingLink: 'https://www.amazon.com/s?k=teak+outdoor+furniture+set+sofa+chairs', notes: '' },
  ],
  references: [
    { id: 'pr1', title: 'Outdoor Kitchen Build Tutorial', url: 'https://www.youtube.com/results?search_query=outdoor+kitchen+build+tutorial', description: 'Step-by-step guide to building an outdoor kitchen', sourceType: 'youtube', addedDate: '2025-03-10T09:00:00Z' },
    { id: 'pr2', title: 'Covered Patio & Pergola Ideas', url: 'https://www.pinterest.com/search/pins/?q=covered+patio+pergola+string+lights', description: 'Inspiration for covered outdoor living spaces', sourceType: 'pinterest', addedDate: '2025-03-10T09:00:00Z' },
    { id: 'pr3', title: 'Backyard Patio Inspiration', url: 'https://www.houzz.com/photos/query/backyard-patio-remodel', description: 'Real patio remodel projects and ideas', sourceType: 'website', addedDate: '2025-03-10T09:00:00Z' },
  ],
  pictures: [
    { id: 'pp1', url: '/demo/patio-living.png', key: null, caption: '', type: 'design', order: 0 },
    { id: 'pp2', url: '/demo/patio-kitchen.png', key: null, caption: '', type: 'design', order: 1 },
    { id: 'pp3', url: '/demo/patio-moodboard-1.png', key: null, caption: '', type: 'design', order: 2 },
    { id: 'pp4', url: '/demo/patio-boho.png', key: null, caption: '', type: 'progress', order: 3 },
    { id: 'pp5', url: '/demo/patio-modern.png', key: null, caption: '', type: 'design', order: 4 },
    { id: 'pp6', url: '/demo/patio-moodboard-2.png', key: null, caption: '', type: 'design', order: 5 },
    { id: 'pp7', url: '/demo/patio-trellis.png', key: null, caption: '', type: 'progress', order: 6 },
    { id: 'pp8', url: '/demo/patio-garden-1.png', key: null, caption: '', type: 'design', order: 7 },
    { id: 'pp9', url: '/demo/patio-garden-2.png', key: null, caption: '', type: 'design', order: 8 },
  ],
  role: 'owner',
  ownerEmail: 'demo@draft2done.com',
  createdDate: '2025-03-10T09:00:00Z',
  collaborators: [
    { email: 'alex@patio.com', permission: 'edit' },
    { email: 'jordan@patio.com', permission: 'edit' },
    { email: 'sam@patio.com', permission: 'view' },
  ],
}

export const DEMO_PROJECTS = [BIRTHDAY_PROJECT, PATIO_PROJECT]

// Legacy export kept for any direct references
export const DEMO_PROJECT = BIRTHDAY_PROJECT
