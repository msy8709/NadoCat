import express from "express";
import { signup, login, kakao, google, getNewAccessToken, logout } from "../controller/user/Users";
import { signupValidator, loginValidator } from "../middleware/validator";
import {
  updateNickname,
  updatePassword,
  updateProfile,
  deleteProfile,
  authPassword,
  updateDetail,
  userPage,
  myPage,
  deleteUser,
} from "../controller/user/MyPage";
import {
  getFavoriteCats,
  getFavoriteCat,
  addFavoriteCat,
  deleteFavoriteCat,
} from "../controller/streetCat/StreetCatsFavorite";
import { follow, followings, getFollowing, unfollow } from "../controller/friend/Friends";
import { ensureAutorization } from "../middleware/auth";
import uploadImages from "../multer";
import { getInterests } from "../controller/interest/Interests";

const router = express.Router();

//사용자
router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/logout", ensureAutorization, logout);
router.post("/refresh-token", getNewAccessToken);
router.get("/auth/kakao/callback", kakao);
router.get("/auth/google", google);

router.get("/user/:uuid", ensureAutorization, userPage); //사용자 프로필
router.get("/my", ensureAutorization, myPage); //마이페이지
router.get("/my/interests", ensureAutorization , getInterests);

router.put("/my/setting/nickname", ensureAutorization, updateNickname);
router.put("/my/setting/detail", ensureAutorization, updateDetail);
router.post("/my/setting/auth-password", ensureAutorization, authPassword);
router.put("/my/setting/password", ensureAutorization, updatePassword);
router.put("/my/setting/delete-user", ensureAutorization, deleteUser);

router.post("/update-profile", ensureAutorization, uploadImages.single("profileImage"), updateProfile);
router.put("/delete-profile", ensureAutorization, deleteProfile);

// 동네 고양이 도감 즐겨찾기(내 도감)
router.get("/street-cats", getFavoriteCats);
router.get("/street-cats/:street_cat_id", getFavoriteCat);
router.post("/street-cats/:street_cat_id", addFavoriteCat);
router.delete("/street-cats/:street_cat_id", deleteFavoriteCat);

// 친구 맺기
router.post("/follows/:following_id", ensureAutorization, follow);
router.delete("/follows/:following_id", ensureAutorization, unfollow);
router.get("/follows/:following_id", ensureAutorization, getFollowing);
router.get("/followings", ensureAutorization, followings);

export default router;
