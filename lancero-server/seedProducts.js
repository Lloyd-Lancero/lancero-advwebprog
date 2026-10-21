require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Category = require('./models/categoryModel');
const Supplier = require('./models/supplierModel');

const products = [
    {
        name: 'campus-tote-bag',
        title: 'Campus Tote Bag',
        category: 'Bags',
        price: 499,
        stock: 25,
        availability: 'In stock',
        image: '/products/essentials.jpg',
        content: [
            'A roomy everyday tote for books, gym clothes, chargers, and quick campus errands.',
            'Made with thick canvas, reinforced handles, and a clean monochrome print.',
            'Best for students who want one simple carry-all bag for class and after-class plans.'
        ]
    },
    {
        name: 'daily-notes-pack',
        title: 'Daily Notes Pack',
        category: 'Stationery',
        price: 249,
        stock: 30,
        availability: 'In stock',
            image: '/products/sticker-set.jpg',
        content: [
            'A practical bundle of notebooks, sticky notes, and quick-label tabs for daily class work.',
            'The set is light, compact, and easy to keep inside a backpack or locker.',
            'Useful for lectures, reminders, project lists, and exam review schedules.'
        ]
    },
    {
        name: 'stainless-tumbler',
        title: 'Stainless Tumbler',
        category: 'Drinkware',
        price: 599,
        stock: 6,
        availability: 'Low stock',
        image: '/products/stainless-tumbler.jpg',
        content: [
            'A double-wall tumbler built for water, coffee, or tea during long school days.',
            'The matte finish keeps the look simple while the lid helps reduce spills in your bag.',
            'Fits most side pockets and keeps drinks ready between classes.'
        ]
    },
    {
        name: 'wireless-study-lamp',
        title: 'Wireless Study Lamp',
        category: 'Tech',
        price: 899,
        stock: 12,
        availability: 'In stock',
        image: '/products/wireless-study-lamp.jpg',
        content: [
            'A compact rechargeable lamp for dorm desks, night study sessions, and small workspaces.',
            'It has three brightness levels and a foldable body that stores neatly after use.',
            'Good for reading, writing, and focused desk work without taking too much space.'
        ]
    },
    {
        name: 'jacket',
        title: 'Jacket',
        category: 'Apparel',
        price: 1199,
        stock: 0,
        availability: 'Preorder',
        image: '/products/jacket.png',
        content: [
            'A soft everyday jacket with a relaxed fit for classrooms, commute days, and weekends.',
            'The heavy cotton blend keeps structure while staying comfortable for regular wear.',
            'Available through preorder so sizes can be reserved before release.'
        ]
    },
    {
        name: 'desk-organizer-kit',
        title: 'Desk Organizer Kit',
        category: 'Workspace',
        price: 349,
        stock: 20,
        availability: 'In stock',
        image: '/products/desk-organizer-kit.jpg',
        content: [
            'A small organizer set for pens, clips, cables, cards, and other desk essentials.',
            'The modular pieces can be arranged based on your study area or dorm table.',
            'Keeps daily tools visible without adding clutter.'
        ]
    },
    {
        name: 'id-lanyard',
        title: 'ID Lanyard',
        category: 'Accessories',
        price: 179,
        stock: 40,
        availability: 'In stock',
        image: '/products/lanyard.jpg',
        content: [
            'A durable lanyard and card holder for IDs, access cards, and small passes.',
            'The clip is easy to detach when scanning or presenting credentials.',
            'Simple enough for daily use and sturdy enough for a full semester.'
        ]
    },
    {
        name: 'exam-week-care-pack',
        title: 'Exam Week Care Pack',
        category: 'Bundles',
        price: 399,
        stock: 15,
        availability: 'In stock',
        image: '/products/supplies.jpg',
        content: [
            'A compact bundle with snacks, tabs, pens, and quick notes for busy review weeks.',
            'Packed for convenience so students can grab one kit and focus on studying.',
            'Ideal as a personal prep item or a small gift for classmates.'
        ]
    }
];

const seedProducts = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const supplier = await Supplier.findOneAndUpdate(
        { name: 'BulldogEx Store' },
        { name: 'BulldogEx Store', description: 'Campus essentials supplier' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const categoryNames = [...new Set(products.map((product) => product.category))];
    const categories = await Promise.all(categoryNames.map((name) => Category.findOneAndUpdate(
        { name },
        { name, description: `${name} for campus life` },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    )));
    const categoryIds = new Map(categories.map((category) => [category.name, category._id]));

    for (const product of products) {
        await Product.findOneAndUpdate(
            { name: product.name },
            {
                ...product,
                category: categoryIds.get(product.category),
                supplier: supplier._id,
                image: product.image
            },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );
    }

    console.log(`Seeded ${products.length} products.`);
};

seedProducts()
    .catch((error) => {
        console.error('Product seed failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
