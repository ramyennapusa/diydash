// Mock detailed project data
// This data structure matches the DetailedProject model requirements from the design document

const mockProjectDetails = {
  "1": {
    id: "1",
    title: "Wooden Coffee Table",
    description: "A rustic wooden coffee table made from reclaimed oak wood with a natural finish. This project combines traditional woodworking techniques with modern design principles to create a functional and beautiful piece of furniture.",
    status: "In Progress",
    createdDate: new Date("2024-01-15"),
    estimatedTime: "3-4 weeks",
    difficulty: "Intermediate",
    pictures: [
      {
        id: "p1-1",
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
        caption: "Initial wood selection and planning",
        type: "progress",
        order: 1
      },
      {
        id: "p1-2",
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
        caption: "Wood preparation and cutting",
        type: "progress",
        order: 2
      },
      {
        id: "p1-3",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
        caption: "Assembly process",
        type: "progress",
        order: 3
      },
      {
        id: "p1-4",
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
        caption: "Reference design inspiration",
        type: "reference",
        order: 4
      }
    ],
    tasks: [
      {
        id: "t1-1",
        title: "Design and measure table dimensions",
        description: "Create detailed plans with measurements for the coffee table",
        completed: true,
        estimatedTime: "2 hours",
        difficulty: "Beginner",
        order: 1,
        category: "Planning"
      },
      {
        id: "t1-2",
        title: "Source reclaimed oak wood",
        description: "Find and purchase quality reclaimed oak boards",
        completed: true,
        estimatedTime: "4 hours",
        difficulty: "Beginner",
        order: 2,
        category: "Materials"
      },
      {
        id: "t1-3",
        title: "Cut wood to size",
        description: "Cut all pieces according to the design specifications",
        completed: true,
        estimatedTime: "3 hours",
        difficulty: "Intermediate",
        order: 3,
        category: "Construction"
      },
      {
        id: "t1-4",
        title: "Sand all surfaces",
        description: "Sand all wood pieces starting with coarse grit and finishing with fine grit",
        completed: false,
        estimatedTime: "4 hours",
        difficulty: "Beginner",
        order: 4,
        category: "Construction"
      },
      {
        id: "t1-5",
        title: "Assemble table frame",
        description: "Join the legs and aprons using mortise and tenon joints",
        completed: false,
        estimatedTime: "6 hours",
        difficulty: "Advanced",
        order: 5,
        category: "Construction"
      },
      {
        id: "t1-6",
        title: "Attach table top",
        description: "Secure the table top to the frame allowing for wood movement",
        completed: false,
        estimatedTime: "2 hours",
        difficulty: "Intermediate",
        order: 6,
        category: "Construction"
      },
      {
        id: "t1-7",
        title: "Apply finish",
        description: "Apply natural oil finish to protect and enhance the wood grain",
        completed: false,
        estimatedTime: "3 hours",
        difficulty: "Beginner",
        order: 7,
        category: "Finishing"
      }
    ],
    videos: [
      {
        id: "v1-1",
        title: "Mortise and Tenon Joint Tutorial",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        type: "tutorial",
        description: "Learn how to create strong mortise and tenon joints for furniture",
        duration: "15:30",
        thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
      },
      {
        id: "v1-2",
        title: "Wood Finishing Techniques",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        type: "tutorial",
        description: "Different approaches to finishing reclaimed wood furniture",
        duration: "12:45",
        thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
      },
      {
        id: "v1-3",
        title: "Project Progress - Week 2",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        type: "progress",
        description: "Weekly progress update showing assembly process",
        duration: "8:20",
        thumbnail: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"
      }
    ],
    materials: [
      {
        id: "m1-1",
        name: "Reclaimed Oak Boards",
        quantity: "8 board feet",
        specification: "2\" thick, various widths, kiln dried",
        estimatedCost: 120,
        supplier: "Local Reclaimed Wood Supplier",
        category: "Wood",
        essential: true
      },
      {
        id: "m1-2",
        name: "Wood Glue",
        quantity: "1 bottle (16 oz)",
        specification: "Titebond III waterproof wood glue",
        estimatedCost: 12,
        supplier: "Home Depot",
        category: "Adhesives",
        essential: true
      },
      {
        id: "m1-3",
        name: "Wood Screws",
        quantity: "20 pieces",
        specification: "2.5\" pocket hole screws",
        estimatedCost: 8,
        supplier: "Lowes",
        category: "Hardware",
        essential: true
      },
      {
        id: "m1-4",
        name: "Natural Oil Finish",
        quantity: "1 quart",
        specification: "Tung oil or Danish oil finish",
        estimatedCost: 25,
        supplier: "Woodcraft",
        category: "Finish",
        essential: true
      },
      {
        id: "m1-5",
        name: "Sandpaper",
        quantity: "Assorted grits",
        specification: "80, 120, 220 grit sandpaper sheets",
        estimatedCost: 15,
        supplier: "Home Depot",
        category: "Consumables",
        essential: true
      }
    ],
    tools: [
      {
        id: "tool1-1",
        name: "Table Saw",
        description: "For cutting wood to precise dimensions",
        essential: true,
        alternatives: ["Circular saw with guide", "Hand saw"],
        category: "Power Tools"
      },
      {
        id: "tool1-2",
        name: "Mortise Chisel Set",
        description: "For cutting mortise and tenon joints",
        essential: true,
        alternatives: ["Regular chisels", "Router with mortise attachment"],
        category: "Hand Tools"
      },
      {
        id: "tool1-3",
        name: "Random Orbital Sander",
        description: "For smooth surface preparation",
        essential: false,
        alternatives: ["Sanding block", "Palm sander"],
        category: "Power Tools"
      },
      {
        id: "tool1-4",
        name: "Clamps",
        description: "Various sizes for glue-ups and assembly",
        essential: true,
        alternatives: ["Rope and wedges", "Heavy objects for weight"],
        category: "Clamping"
      },
      {
        id: "tool1-5",
        name: "Drill/Driver",
        description: "For pilot holes and assembly screws",
        essential: true,
        alternatives: ["Hand drill", "Screwdriver"],
        category: "Power Tools"
      }
    ]
  },
  "2": {
    id: "2",
    title: "Arduino LED Strip Controller",
    description: "Smart LED strip controller using Arduino with mobile app integration. This project combines electronics, programming, and mobile development to create a versatile lighting control system.",
    status: "Planning",
    createdDate: new Date("2024-02-01"),
    estimatedTime: "2-3 weeks",
    difficulty: "Advanced",
    pictures: [
      {
        id: "p2-1",
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
        caption: "Arduino and LED strip components",
        type: "reference",
        order: 1
      },
      {
        id: "p2-2",
        url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop",
        caption: "Circuit diagram and breadboard layout",
        type: "reference",
        order: 2
      }
    ],
    tasks: [
      {
        id: "t2-1",
        title: "Design circuit schematic",
        description: "Create detailed circuit diagram for Arduino LED controller",
        completed: false,
        estimatedTime: "3 hours",
        difficulty: "Intermediate",
        order: 1,
        category: "Design"
      },
      {
        id: "t2-2",
        title: "Order electronic components",
        description: "Purchase Arduino, LED strips, resistors, and other components",
        completed: false,
        estimatedTime: "1 hour",
        difficulty: "Beginner",
        order: 2,
        category: "Materials"
      },
      {
        id: "t2-3",
        title: "Build prototype on breadboard",
        description: "Assemble and test the circuit on a breadboard",
        completed: false,
        estimatedTime: "4 hours",
        difficulty: "Intermediate",
        order: 3,
        category: "Electronics"
      },
      {
        id: "t2-4",
        title: "Write Arduino code",
        description: "Program the Arduino to control LED patterns and colors",
        completed: false,
        estimatedTime: "8 hours",
        difficulty: "Advanced",
        order: 4,
        category: "Programming"
      },
      {
        id: "t2-5",
        title: "Create mobile app",
        description: "Develop mobile app for wireless LED control",
        completed: false,
        estimatedTime: "12 hours",
        difficulty: "Advanced",
        order: 5,
        category: "Programming"
      }
    ],
    videos: [
      {
        id: "v2-1",
        title: "Arduino LED Strip Control Tutorial",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        type: "tutorial",
        description: "Complete guide to controlling LED strips with Arduino",
        duration: "25:15",
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop"
      }
    ],
    materials: [
      {
        id: "m2-1",
        name: "Arduino Uno R3",
        quantity: "1 piece",
        specification: "Official Arduino board with USB cable",
        estimatedCost: 25,
        supplier: "Arduino Store",
        category: "Electronics",
        essential: true
      },
      {
        id: "m2-2",
        name: "WS2812B LED Strip",
        quantity: "5 meters",
        specification: "60 LEDs per meter, waterproof",
        estimatedCost: 35,
        supplier: "Adafruit",
        category: "Electronics",
        essential: true
      }
    ],
    tools: [
      {
        id: "tool2-1",
        name: "Soldering Iron",
        description: "For making permanent electrical connections",
        essential: true,
        alternatives: ["Breadboard connections", "Wire nuts"],
        category: "Electronics"
      }
    ]
  },
  "3": {
    id: "3",
    title: "Garden Raised Bed",
    description: "Cedar wood raised garden bed for growing vegetables and herbs. This project creates a sustainable growing space that's perfect for beginners and experienced gardeners alike.",
    status: "Completed",
    createdDate: new Date("2023-12-10"),
    estimatedTime: "1 weekend",
    difficulty: "Beginner",
    pictures: [
      {
        id: "p3-1",
        url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop",
        caption: "Completed raised bed with plants",
        type: "final",
        order: 1
      },
      {
        id: "p3-2",
        url: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=600&fit=crop",
        caption: "Construction process",
        type: "progress",
        order: 2
      }
    ],
    tasks: [
      {
        id: "t3-1",
        title: "Plan garden bed dimensions",
        description: "Determine optimal size and location for the raised bed",
        completed: true,
        estimatedTime: "1 hour",
        difficulty: "Beginner",
        order: 1,
        category: "Planning"
      },
      {
        id: "t3-2",
        title: "Cut cedar boards",
        description: "Cut cedar boards to required lengths for the frame",
        completed: true,
        estimatedTime: "2 hours",
        difficulty: "Beginner",
        order: 2,
        category: "Construction"
      },
      {
        id: "t3-3",
        title: "Assemble frame",
        description: "Join the cedar boards to create the raised bed frame",
        completed: true,
        estimatedTime: "3 hours",
        difficulty: "Beginner",
        order: 3,
        category: "Construction"
      },
      {
        id: "t3-4",
        title: "Install and fill with soil",
        description: "Position the bed and fill with quality garden soil",
        completed: true,
        estimatedTime: "2 hours",
        difficulty: "Beginner",
        order: 4,
        category: "Installation"
      }
    ],
    videos: [
      {
        id: "v3-1",
        title: "Building Raised Garden Beds",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        type: "tutorial",
        description: "Step-by-step guide to building cedar raised beds",
        duration: "18:30",
        thumbnail: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop"
      }
    ],
    materials: [
      {
        id: "m3-1",
        name: "Cedar Boards",
        quantity: "8 pieces",
        specification: "2x8x8 untreated cedar boards",
        estimatedCost: 80,
        supplier: "Home Depot",
        category: "Wood",
        essential: true
      },
      {
        id: "m3-2",
        name: "Corner Brackets",
        quantity: "4 pieces",
        specification: "Galvanized steel corner brackets",
        estimatedCost: 16,
        supplier: "Lowes",
        category: "Hardware",
        essential: true
      },
      {
        id: "m3-3",
        name: "Garden Soil",
        quantity: "20 cubic feet",
        specification: "Organic vegetable garden soil mix",
        estimatedCost: 60,
        supplier: "Local Garden Center",
        category: "Soil",
        essential: true
      }
    ],
    tools: [
      {
        id: "tool3-1",
        name: "Circular Saw",
        description: "For cutting cedar boards to length",
        essential: true,
        alternatives: ["Hand saw", "Miter saw"],
        category: "Power Tools"
      },
      {
        id: "tool3-2",
        name: "Drill",
        description: "For assembling the frame with screws",
        essential: true,
        alternatives: ["Screwdriver", "Impact driver"],
        category: "Power Tools"
      }
    ]
  }
}

export default mockProjectDetails