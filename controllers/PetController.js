const Pet = require("../models/Pet");
const User = require("../models/User");

//helpers
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class PetController {
  //create a product with the data provided
  static async create(req, res) {
    const { name, age, weight, color, price, description, quantity } = req.body;
    const images = req.files;
    const available = true;

    //images upload

    //validation
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório" });
      return;
    }
    if (!price) {
      res.status(422).json({ message: "O preço é obrigatório" });
      return;
    }
    if (!description) {
      res.status(422).json({ message: "A descrição é obrigatória" });
      return;
    }
    if (images.length === 0) {
      res.status(422).json({ message: "A imagem é obrigatória" });
      return;
    }

    //get pet owner
    const token = getToken(req);
    const user = await getUserByToken(token);

    //create a pet
    const pet = new Pet({
      name,
      age,
      weight,
      color,
      price,
      description,
      quantity,
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        image: user.image,
      },
    });

    images.map((image) => {
      pet.images.push(image.filename);
    });

    //save pet
    try {
      const newPet = await pet.save();
      res.status(201).json({ message: "Produto criado com sucesso", newPet });
    } catch (error) {
      res.status(500).json({ message: "Erro ao salvar o novo produto" });
      return;
    }
  }

  static async getAll(req, res) {
    try {
      const pets = await Pet.find().sort("-createdAt");
      res.status(200).json({ pets });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar pets" });
      return;
    }
  }

  static async getAllUserPets(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    try {
      const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt");
      res.status(200).json({ pets });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar pets" });
      return;
    }
  }

  static async getAllUserAdoptions(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);

    try {
      const chart = user.chart;

      // console.log(chart);

      // const pets = await Pet.find({ "adopter._id": user._id }).sort(
      //   "-createdAt"
      // );
      res.status(200).json({ chart });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produtos" });
      return;
    }
  }

  static async getPetById(req, res) {
    const id = req.params.id;

    //check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "Id inválido" });
      return;
    }

    //check if pet exists
    const pet = await Pet.findById(id);

    if (!pet) {
      res.status(404).json({ message: "Produto não encontrado" });
      return;
    }

    res.status(200).json({ pet });
  }

  static async removePetById(req, res) {
    const id = req.params.id;

    //check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "Id inválido" });
      return;
    }
    //check if pet exists
    const pet = await Pet.findById(id);

    if (!pet) {
      res.status(404).json({ message: "Produto não encontrado" });
      return;
    }

    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);
    const userId = user._id;

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(401).json({ message: "Não autorizado" });
      return;
    }
    await Pet.findByIdAndRemove(id);
    res.status(200).json({ message: "Produto removido com sucesso" });
  }

  static async deleteProduct(req, res) {
    const id = req.params.id;
    console.log(id)

    //check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "Id inválido" });
      return;
    }
    //check if pet exists
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res.status(404).json({ message: "Produto não encontrado" });
      return;
    }

    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);
    const chart = user.chart;

    const filteredCart = chart.filter((chart) => {
      return chart._id.toString() !== id.toString();
    });

    user.chart = filteredCart;

    await User.findByIdAndUpdate(user._id, user);
    res.status(200).json({ message: "Produto removido com sucesso" });

    // if (pet.user._id.toString() !== user._id.toString()) {
    //   res.status(401).json({ message: "Não autorizado" });
    //   return;
    // }
    // await Pet.findByIdAndRemove(id);
    // res.status(200).json({ message: "Produto removido com sucesso" });
  }

  static async updatePetById(req, res) {
    const id = req.params.id;
    const {
      name,
      age,
      weight,
      color,
      price,
      description,
      quantity,
      available,
    } = req.body;
    const images = req.files;

    const updatedData = {};

    //check if pet exists
    const pet = await Pet.findById(id);

    if (!pet) {
      res.status(404).json({ message: "Produto não encontrado" });
      return;
    }
    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(401).json({ message: "Não autorizado" });
      return;
    }
    //validation
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório" });
      return;
    } else {
      updatedData.name = name;
    }

    updatedData.age = age || "";
    updatedData.weight = weight || "";
    updatedData.color = color || "";

    if (!price) {
      res.status(422).json({ message: "O preço é obrigatório" });
      return;
    } else {
      updatedData.price = price;
    }
    if (!description) {
      res.status(422).json({ message: "A descrição é obrigatória" });
      return;
    } else {
      updatedData.description = description;
    }
    if (images.length > 0) {
      updatedData.images = [];
      images.map((image) => {
        updatedData.images.push(image.filename);
      });
    }

    await Pet.findByIdAndUpdate(id, updatedData);

    res.status(200).json({ message: "Produto atualizado com sucesso" });
  }

  static async schedule(req, res) {
    const id = req.params.id;

    //check if pet exists
    const pet = await Pet.findById(id);

    if (!pet) {
      res.status(404).json({ message: "Produto não encontrado" });
      return;
    }

    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    //check if user already has in chart
    let chart = user.chart;
    const filteredCart = chart.filter((pet) => {
      return pet._id.toString() === id.toString();
    });

    if (filteredCart.length !== 0) {
      res.status(409).json({ message: "Produto já adicionado" });
   
      return
    }

    user.chart.push({
      _id: pet._id,
      name: pet.name,
      image: pet.images,
      price: pet.price,
      quantity: pet.quantity || 1,
    });

    await User.findByIdAndUpdate(user._id, user);
    res.status(200).json({
      message: `O produto ${pet.name} foi adicionado ao seu carrinho`,
    });
  }

  static async updateCart(req, res) {
    const id = req.params.id;

    const token = getToken(req);
    const user = await getUserByToken(token);
    const index = user.chart.findIndex((item) => item._id.equals(id));

    if (index === -1) {
      res.status(404).json({ message: "Produto não encontrado" });
      return;
    }

    user.chart[index].quantity += 1;
    await User.findByIdAndUpdate(user._id, user);
    
    res.status(200).json({ message: "Produto atualizado com sucesso" });
  }
  static async updateCartDown(req, res) {
    const id = req.params.id;

    const token = getToken(req);
    const user = await getUserByToken(token);
    const index = user.chart.findIndex((item) => item._id.equals(id));

    if (index === -1) {
      res.status(404).json({ message: "Produto não encontrado" });
      return;
    }

    user.chart[index].quantity -= 1;
    await User.findByIdAndUpdate(user._id, user);

    res.status(200).json({ message: "Produto atualizado com sucesso" });
  }

  static async concludeAdoption(req, res) {
    const id = req.params.id;
    //check if pet exists
    const pet = await Pet.findById(id);

    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado" });
      return;
    }

    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (!pet.user._id.equals(user._id)) {
      res.status(401).json({
        message: "Você não pode concluir uma adoção do pet de outra pessoa!",
      });
      return;
    }

    pet.available = false;
    await Pet.findByIdAndUpdate(id, pet);

    res.status(200).json({ message: "Adoção concluída com sucesso" });
  }
};
