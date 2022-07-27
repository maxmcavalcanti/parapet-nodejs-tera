const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//helpers
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class UserController {
  static async register(req, res) {
    const { name, phone, email, password, confirmPassword } = req.body; //destructuring

    //validation
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório" });
      return;
    }
    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório" });
      return;
    }
    if (!email) {
      res.status(422).json({ message: "O e-mail é obrigatório" });
      return;
    }

    if (!password) {
      res.status(422).json({ message: "A senha é obrigatória" });
      return;
    }
    if (!confirmPassword) {
      res.status(422).json({ message: "A confirmação de senha é obrigatória" });
      return;
    }
    if (password !== confirmPassword) {
      res.status(422).json({ message: "As senhas não conferem" });
      return;
    }
    //check if email already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(422).json({ message: "E-mail já cadastrado" });
      return;
    }

    //create a password hash
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create a new user
    const user = new User({
      name,
      phone,
      email,
      password: hashedPassword,
    });

    //save the user
    try {
      const newUser = await user.save();

      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({ message: "Erro ao cadastrar usuário" });
      return;
    }
  }

  //login user

  static async login(req, res) {
    const { email, password } = req.body;

    //validation
    if (!email) {
      res.status(422).json({ message: "E-mail obrigatório" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "Senha obrigatória" });
      return;
    }

    //check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res
        .status(422)
        .json({ message: "Usuário não encontrado com este e-mail!" });
      return;
    }

    //check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(422).json({ message: "Senha inválida" });
      return;
    }

    await createUserToken(user, req, res);
  }

  //check user token

  static async checkUser(req, res) {
    let currentUser;
    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "nossosecret");

      currentUser = await User.findById(decoded.id);

      currentUser.password = undefined;
    } else {
      currentUser = null;
    }
    res.status(200).send(currentUser);
  }
  static async getUserById(req, res) {
    const id = req.params.id;

    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(422).json({ message: "Usuário não encontrado" });
      return;
    }

    res.status(200).json({ user });
  }

  static async editUser(req, res) {
    const id = req.params.id;
    const { name, email, phone, password, confirmPassword } = req.body;

    //check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (req.file) {
      user.image = req.file.filename;
    }
    //validations for edit user
    //validation
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatório" });
      return;
    }
    user.name = name;
    if (!email) {
      res.status(422).json({ message: "O e-mail é obrigatório" });
      return;
    }

    //check if email already exists
    const userExists = await User.findOne({ email });

    if (user.email !== email && userExists) {
      res.status(422).json({ message: "E-mail já cadastrado" });
      return;
    }
    user.email = email;
    if (!phone) {
      res.status(422).json({ message: "O telefone é obrigatório" });
      return;
    }
    user.phone = phone;

    if (password !== confirmPassword) {
      res.status(422).json({ message: "As senhas não conferem" });
      return;
    } else if (password === confirmPassword && password != null) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    try {
      //returns user updated data
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );
      res.status(200).json({ message: "Usuário atualizado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao editar usuário", error });
      console.log(error);
      return;
    }
    //check if user exists
  }
};
