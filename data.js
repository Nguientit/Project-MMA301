export const recipes = [
  {
    id: "1",
    name: "Palak Paneer",
    price: 70000,
    category: "Dinner",
    description:
      "Món ăn Ấn Độ kết hợp paneer với sốt rau chân vịt kem. Hương vị nhẹ nhàng, phù hợp với roti hoặc paratha.",
    calories: 350,
    cookingTime: "30 phút",
    servings: 4,
    image:
      "https://healthynibblesandbits.com/wp-content/uploads/2020/01/Saag-Paneer-FF.jpg",
    ingredients: [
      { name: "Rau chân vịt", amount: "2 bó (500g)" },
      { name: "Paneer", amount: "250g, cắt khối" },
      { name: "Hành tây", amount: "1 củ lớn, băm nhỏ" },
      { name: "Tỏi", amount: "4-5 tép, băm nhuyễn" },
      { name: "Gừng", amount: "1 miếng 2cm, bào nhỏ" },
    ],
    instructions: [
       "Dùng nóng với bánh roti hoặc paratha.",
       "Có thể thêm sữa chua hoặc nước chanh cho vị tươi mát.",
       "Dùng nóng với bánh roti"
    ],
  },
  {
    id: "2",
    name: "Gà Tikka Masala",
    price: 70000,
    category: "Dinner",
    description:
      "Món gà nướng sốt cà chua kem đặc trưng của Ấn Độ, có vị cay nhẹ.",
    calories: 450,
    cookingTime: "40 phút",
    servings: 4,
    image:
      "https://mia.vn/media/uploads/blog-du-lich/tikka-masala-1-1725207163.jpg",
    ingredients: [
      { name: "Thịt gà", amount: "500g, không xương" },
      { name: "Sữa chua", amount: "1 cốc" },
      { name: "Cà chua", amount: "2 quả lớn, xay nhuyễn" },
      { name: "Tỏi", amount: "3 tép, băm nhuyễn" },
      {
        name: "Gia vị",
        amount: "Theo khẩu vị (garam masala, thì là, nghệ...)",
      },
    ],
    instructions: [
       "Ăn nóng cùng cơm basmati hoặc bánh naan.",
      "Phù hợp khi ăn kèm với dưa leo và hành tím ngâm.",
    ],
  },
  {
    id: "3",
    name: "Cơm Risotto Nấm",
    price: 70000,
    category: "Lunch",
    description:
      "Món cơm kiểu Ý nấu với nấm, rượu vang trắng và phô mai Parmesan.",
    calories: 380,
    cookingTime: "35 phút",
    servings: 2,
    image:
      "https://cdn.tgdd.vn/Files/2021/07/31/1372009/2-cach-lam-mon-risotto-thom-ngon-tu-nuoc-y-202107311137097170.jpg",
    ingredients: [
      { name: "Gạo Arborio", amount: "1 cốc" },
      { name: "Nấm", amount: "200g, cắt lát" },
      { name: "Nước dùng rau củ", amount: "4 cốc" },
      { name: "Phô mai Parmesan", amount: "50g, bào nhỏ" },
      { name: "Rượu vang trắng", amount: "1/2 cốc" },
    ],
    instructions: [
        "Thưởng thức nóng, rắc thêm phô mai Parmesan khi ăn.",
        "Để thưởng thức nóng, rắc thêm phô mai Parmesan khi ăn.",
        "Dùng kèm rượu vang trắng sẽ tăng hương vị.",
    ],
  },
  {
    id: "4",
    name: "Pad Thai",
    price: 70000,
    category: "Fastfood",
    description:
      "Món mì xào nổi tiếng của Thái với tôm, đậu hũ, đậu phộng và sốt chua ngọt.",
    calories: 400,
    cookingTime: "25 phút",
    servings: 3,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Phat_Thai_kung_Chang_Khien_street_stall.jpg/800px-Phat_Thai_kung_Chang_Khien_street_stall.jpg",
    ingredients: [
      { name: "Mì gạo", amount: "200g" },
      { name: "Tôm", amount: "150g, bóc vỏ" },
      { name: "Đậu hũ", amount: "100g, cắt khối" },
      { name: "Đậu phộng", amount: "2 muỗng canh, giã nhỏ" },
      { name: "Trứng", amount: "1 quả, đánh tan" },
    ],
    instructions: [
     "Ăn khi còn nóng, vắt thêm chanh và rắc đậu phộng giã nhỏ lên trên.",
      "Dùng kèm giá sống và rau thơm nếu thích.",
      "Ngon hơn khi thêm ớt"
    ],
  },
  {
    id: "5",
    name: "Pizza Margherita",
    price: 70000,
    category: "Fastfood",
    description: "Pizza Ý cổ điển với cà chua, phô mai mozzarella và húng quế.",
    calories: 300,
    cookingTime: "20 phút",
    servings: 2,
    image:
      "https://assets.tmecosys.com/image/upload/t_web767x639/img/recipe/ras/Assets/5802fab5-fdce-468a-a830-43e8001f5a72/Derivates/c00dc34a-e73d-42f0-a86e-e2fd967d33fe.jpg",
    ingredients: [
      { name: "Đế bánh pizza", amount: "1 cái, 30cm" },
      { name: "Sốt cà chua", amount: "1/2 cốc" },
      { name: "Phô mai Mozzarella", amount: "150g, cắt lát" },
      { name: "Lá húng quế tươi", amount: "Vài lá" },
      { name: "Dầu ô liu", amount: "1 muỗng canh" },
    ],
    instructions: [
       "Ăn khi còn nóng để cảm nhận vị giòn của vỏ bánh và béo ngậy của phô mai.",
       "Có thể dùng kèm tương ớt hoặc lá oregano rắc thêm.",
       "Ngon hơn khi kèm bia lạnh"
    ],
  },
  {
    id: "6",
    name: "Phở Bò",
    price: 70000,
    category: "Breakfast",
    description:
      "Món phở truyền thống của Việt Nam với nước dùng thơm ngon, thịt bò mềm và bánh phở mềm.",
    calories: 450,
    cookingTime: "2 giờ",
    servings: 4,
    image:
      "https://fohlafood.vn/cdn/shop/articles/bi-quyet-nau-phi-bo-ngon-tuyet-dinh.jpg?v=1712213789",
    ingredients: [
      { name: "Bánh phở", amount: "500g" },
      { name: "Thịt bò", amount: "300g, thái lát mỏng" },
      { name: "Xương bò", amount: "1kg" },
      { name: "Hành tây", amount: "1 củ" },
      { name: "Gừng", amount: "1 củ nhỏ" },
    ],
    instructions: [
      "Ăn nóng, ăn kèm nước phở và thịt bò.",
      "Thêm chanh, ớt, giá sống và rau thơm theo khẩu vị.",
      "Thêm quẩy và các món ăn kèm"
    ],
  },
  {
    id: "7",
    name: "Bánh Xèo",
    price: 70000,
    category: "Lunch",
    description:
      "Bánh xèo giòn rụm với nhân tôm, thịt và giá đỗ, thường ăn kèm với rau sống và nước mắm chua ngọt.",
    calories: 300,
    cookingTime: "30 phút",
    servings: 4,
    image:
      "https://i-giadinh.vnecdn.net/2023/09/19/Bc10Thnhphm11-1695107510-2493-1695107555.jpg",
    ingredients: [
      { name: "Bột gạo", amount: "200g" },
      { name: "Nước cốt dừa", amount: "100ml" },
      { name: "Tôm", amount: "200g, bóc vỏ" },
      { name: "Thịt heo", amount: "150g, thái lát mỏng" },
      { name: "Giá đỗ", amount: "100g" },
    ],
    instructions: [
       "Ăn nóng, cuốn bánh xèo với rau sống và bánh tráng.",
       "Chấm với sốt thần thánh để tăng hương vị.",
    ],
  },
  {
    id: "8",
    name: "Bún Chả",
    price: 70000,
    category: "Lunch",
    description:
      "Món bún chả Hà Nội với thịt nướng thơm ngon, nước mắm chua ngọt và bún tươi.",
    calories: 400,
    cookingTime: "45 phút",
    servings: 4,
    image:
      "https://khaihoanphuquoc.com.vn/wp-content/uploads/2023/08/cach-lam-nuoc-mam-bun-cha-02.jpg",
    ingredients: [
      { name: "Thịt heo xay", amount: "300g" },
      { name: "Bún tươi", amount: "500g" },
      { name: "Nước mắm", amount: "3 muỗng canh" },
      { name: "Đường", amount: "2 muỗng canh" },
      { name: "Tỏi", amount: "3 tép, băm nhuyễn" },
    ],
    instructions: [
      "Ăn kèm bún tươi, rau sống và nước mắm pha chua ngọt.",
      "Có thể thêm đu đủ hoặc cà rốt ngâm để tăng vị giòn.",
    ],
  },
  {
    id: "9",
    name: "Gỏi Cuốn",
    price: 70000,
    category: "Appetizer",
    description:
      "Gỏi cuốn tươi mát với tôm, thịt heo, bún và rau sống, cuốn trong bánh tráng.",
    calories: 200,
    cookingTime: "30 phút",
    servings: 4,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/03/Summer_roll.jpg",
    ingredients: [
      { name: "Bánh tráng", amount: "10 cái" },
      { name: "Tôm", amount: "200g, luộc chín" },
      { name: "Thịt heo", amount: "150g, luộc chín" },
      { name: "Bún tươi", amount: "200g" },
      { name: "Rau sống", amount: "100g" },
    ],
    instructions: [
      "Chấm gỏi cuốn với nước mắm chua ngọt hoặc tương đậu phộng.",
      "Thưởng thức ngay sau khi cuốn để giữ độ tươi và giòn.",
    ],
  },
  {
    id: "10",
    name: "Cá Kho Tộ",
    price: 70000,
    category: "Dinner",
    description:
      "Món cá kho tộ đậm đà với nước màu caramel, thường ăn kèm với cơm trắng.",
    calories: 350,
    cookingTime: "1 giờ",
    servings: 4,
    image: "https://beptruong.edu.vn/wp-content/uploads/2021/01/ca-kho-to.jpg",
    ingredients: [
      { name: "Cá lóc", amount: "1 con (khoảng 500g)" },
      { name: "Nước màu caramel", amount: "2 muỗng canh" },
      { name: "Nước mắm", amount: "3 muỗng canh" },
      { name: "Đường", amount: "1 muỗng canh" },
      { name: "Ớt", amount: "2 quả, thái lát" },
    ],
    instructions: [
     "Dùng với cơm trắng nóng để tận hưởng nước kho đậm đà.",
      "Có thể ăn kèm rau luộc như rau muống, cải xanh.",
    ],
  },
  {
    id: "11",
    name: "Bánh Mì",
    price: 70000,
    category: "Breakfast",
    description:
      "Bánh mì Việt Nam với nhân thịt, chả lụa, rau sống và pate, thường ăn kèm với nước sốt đặc biệt.",
    calories: 300,
    cookingTime: "15 phút",
    servings: 2,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/B%C3%A1nh_m%C3%AC_th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng.png/800px-B%C3%A1nh_m%C3%AC_th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng.png",
    ingredients: [
      { name: "Bánh mì", amount: "2 ổ" },
      { name: "Thịt nguội", amount: "100g" },
      { name: "Chả lụa", amount: "100g" },
      { name: "Rau sống", amount: "50g" },
      { name: "Pate", amount: "2 muỗng canh" },
    ],
    instructions: [
      "Ăn khi bánh còn nóng, phần nhân đầy đủ với pate, thịt nguội, rau sống.",
      "Có thể thêm tương ớt hoặc nước sốt đặc biệt.",
    ],
  },
  {
    id: "12",
    name: "Chả Giò",
    price: 70000,
    category: "Appetizer",
    description:
      "Chả giò giòn rụm với nhân thịt heo, tôm và rau củ, thường ăn kèm với nước mắm chua ngọt.",
    calories: 250,
    cookingTime: "40 phút",
    servings: 4,
    image: "https://assets.unileversolutions.com/recipes-v2/157768.jpg",
    ingredients: [
      { name: "Bánh tráng", amount: "10 cái" },
      { name: "Thịt heo xay", amount: "200g" },
      { name: "Tôm", amount: "100g, bóc vỏ" },
      { name: "Cà rốt", amount: "1 củ, bào sợi" },
      { name: "Mộc nhĩ", amount: "50g, ngâm nở" },
    ],
    instructions: [
      "Dùng nóng, chấm với nước mắm chua ngọt và ăn kèm rau sống.",
      "Thích hợp ăn khai vị hoặc ăn cùng bún.",
    ],
  },
  {
    id: "13",
    name: "Canh Chua Cá",
    price: 70000,
    category: "Dinner",
    description:
      "Món canh chua cá với vị chua ngọt từ me, cá và rau củ, thường ăn kèm với cơm trắng.",
    calories: 200,
    cookingTime: "45 phút",
    servings: 4,
    image:
      "https://i-giadinh.vnecdn.net/2021/03/19/ca2-1616122035-2163-1616122469.jpg",
    ingredients: [
      { name: "Cá lóc", amount: "1 con (khoảng 500g)" },
      { name: "Me", amount: "50g" },
      { name: "Cà chua", amount: "2 quả" },
      { name: "Dọc mùng", amount: "100g" },
      { name: "Rau om", amount: "1 nắm" },
    ],
    instructions: [
      "Ăn nóng, chan canh lên cơm trắng hoặc ăn riêng như món canh.",
      "Có thể thêm rau thơm và ớt để tăng vị.",
    ],
  },
  {
    id: "14",
    name: "Xôi Gà",
    price: 70000,
    category: "Breakfast",
    description:
      "Xôi gà thơm ngon với gà luộc, hành phi và nước mắm, thường ăn kèm với dưa leo.",
    calories: 400,
    cookingTime: "1 giờ",
    servings: 4,
    image:
      "https://cdn.tgdd.vn/Files/2021/09/11/1381810/cach-nau-xoi-ga-xe-nuoc-cot-dua-thom-beo-sieu-nhanh-tai-nha-202109110925505443.jpg",
    ingredients: [
      { name: "Gạo nếp", amount: "500g" },
      { name: "Gà ta", amount: "1 con (khoảng 1kg)" },
      { name: "Hành phi", amount: "2 muỗng canh" },
      { name: "Nước mắm", amount: "3 muỗng canh" },
      { name: "Dưa leo", amount: "1 quả, thái lát" },
    ],
    instructions: [
      "Ăn cùng nước mắm mặn hoặc nước tương, thêm dưa leo cho mát.",
      "Dùng vào buổi sáng hoặc trưa đều phù hợp.",
    ],
  },
  {
    id: "15",
    name: "Bánh Cuốn",
    price: 70000,
    category: "Breakfast",
    description:
      "Bánh cuốn mềm mại với nhân thịt heo và nấm, thường ăn kèm với nước mắm chua ngọt.",
    calories: 300,
    cookingTime: "1 giờ",
    servings: 4,
    image:
      "https://i0.wp.com/mycogroup.com.vn/wp-content/uploads/2023/05/banh-cuon-ha-noi.jpg?resize=1020%2C574&ssl=1",
    ingredients: [
      { name: "Bột gạo", amount: "200g" },
      { name: "Thịt heo xay", amount: "200g" },
      { name: "Nấm mèo", amount: "50g, ngâm nở" },
      { name: "Hành khô", amount: "2 củ, băm nhỏ" },
      { name: "Nước mắm", amount: "3 muỗng canh" },
    ],
    instructions: [
      "Ăn khi còn ấm, chấm với nước mắm chua ngọt.",
      "Có thể ăn kèm chả quế và rau thơm.",
    ],
  },
];

export const myRecipes = [
  {
    id: "16",
    name: "Chocolate Cake",
    price: 70000,
    category: "Dessert",
    description: "Bánh chocolate mềm mịn, ngọt ngào.",
    calories: 450,
    cookingTime: "45 phút",
    servings: 8,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP7mYb2zvY2IGO9_EocEptv0k-JTabTeh58g&s",
    ingredients: [
      { name: "Bột mì", amount: "200g" },
      { name: "Đường", amount: "150g" },
      { name: "Trứng", amount: "3 quả" },
      { name: "Bơ", amount: "100g" },
      { name: "Bột cacao", amount: "50g" },
    ],
    instructions: [
      "Trộn tất cả nguyên liệu.",
      "Nướng trong lò ở 180°C trong 30 phút.",
    ],
  },
  {
    id: "17",
    name: "Paneer Curry",
    price: 70000,
    category: "Dinner",
    description: "Paneer nấu với nước sốt cay đặc trưng của Ấn Độ.",
    calories: 400,
    cookingTime: "40 phút",
    servings: 4,
    image:
      "https://ichef.bbci.co.uk/food/ic/food_16x9_1600/recipes/butter_paneer_curry_98394_16x9.jpg",
    ingredients: [
      { name: "Paneer", amount: "250g" },
      { name: "Cà chua", amount: "2 quả" },
      { name: "Hành tây", amount: "1 củ" },
      { name: "Gia vị", amount: "tuỳ chỉnh" },
    ],
    instructions: [
      "Xào hành và cà chua.",
      "Thêm paneer và gia vị, nấu thêm 15 phút.",
    ],
  },
];

export const savedRecipes = [
  {
    id: "18",
    name: "Mango Mojito",
    price: 70000,
    category: "Beverage",
    description: "Thức uống mát lạnh từ xoài và bạc hà.",
    calories: 120,
    cookingTime: "10 phút",
    servings: 2,
    image:
      "https://www.chilitochoc.com/wp-content/uploads/2023/07/mango-mojito-non-alcoholic.jpg",
    ingredients: [
      { name: "Xoài", amount: "1 quả" },
      { name: "Lá bạc hà", amount: "vài lá" },
      { name: "Đường", amount: "2 muỗng" },
      { name: "Nước soda", amount: "200ml" },
    ],
    instructions: [
      "Xay nhuyễn xoài với đường.",
      "Thêm soda và bạc hà, khuấy đều.",
    ],
  },
  {
    id: "19",
    name: "Quinoa Bowl",
    price: 70000,
    category: "Healthy",
    description: "Bữa ăn nhẹ nhàng với quinoa và rau củ.",
    calories: 350,
    cookingTime: "20 phút",
    servings: 2,
    image:
      "https://images.themodernproper.com/production/posts/2020/QuinoaBowl_4.jpg?w=1200&h=1200&q=60&fm=jpg&fit=crop&dm=1737605526&s=b91b6baac05eb76bd048a76d12f4a9cd",
    ingredients: [
      { name: "Quinoa", amount: "100g" },
      { name: "Rau củ", amount: "200g" },
      { name: "Dầu olive", amount: "1 muỗng canh" },
    ],
    instructions: ["Luộc quinoa cho chín.", "Xào rau củ và trộn với quinoa."],
  },
];
