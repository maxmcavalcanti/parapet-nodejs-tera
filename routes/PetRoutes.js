const router = require("express").Router();

const PetController = require("../controllers/PetController");

//middlewares
const verifyToken = require("../helpers/verify-token");
const { imageUpload } = require("../helpers/image-upload");

router.post(
  "/create",
  verifyToken,
  imageUpload.array("images"),
  PetController.create
);
router.get("/", PetController.getAll);
router.get("/mypets", verifyToken, PetController.getAllUserPets);
router.get("/myadoptions", verifyToken, PetController.getAllUserAdoptions);
router.get("/:id", PetController.getPetById);
router.delete("/:id", verifyToken, PetController.removePetById);
router.patch(
  "/:id",
  verifyToken,
  imageUpload.array("images"),
  PetController.updatePetById
);
router.patch("/schedule/:id", verifyToken, PetController.schedule);
router.delete("/myadoptions/:id", verifyToken, PetController.deleteProduct);
router.patch("/myadoptions/cart/:id",verifyToken, PetController.updateCart);
router.patch("/myadoptions/cart/down/:id",verifyToken, PetController.updateCartDown);
router.patch("/conclude/:id", verifyToken, PetController.concludeAdoption);

module.exports = router;
