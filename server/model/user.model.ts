import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";


const prisma = new PrismaClient();

//[x]회원가입
export const createUser = async (email: string, nickname: string, password: string) => {

  const hashing = async (password: string) => {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hashPassword = await bcrypt.hash(password, salt);
    return { salt, hashPassword };
  };

  const { salt, hashPassword } = await hashing(password);
  const uuid = uuidv4();
  console.log("uuid원형: ", uuid);
  console.log("uuid하이픈제거: ", uuid.replace(/-/g, ""));

  const uuidBuffer = Buffer.from(uuid.replace(/-/g, ""), "hex");

  try {
    //중복 사용자 검증
    const selectUser = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });

    if (selectUser && selectUser.status === "active") {
      console.log("사용중인 이메일입니다.");
      return null;
    }

    //새로 가입
    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.users.create({
        data: {
          uuid: uuidBuffer,
          email: email,
          profileImage: "https://nadocat.s3.ap-northeast-2.amazonaws.com/profileCat_default.png",
          nickname: nickname,
          authType: "general",
          status: "active",
        },
      });

      const secretUser = await prisma.userSecrets.create({
        data: {
          uuid: uuidBuffer,
          hashPassword: hashPassword,
          salt: salt,
        },
      });


      return { user, secretUser };
    });

    return result;

  } catch (error) {
    console.log("회원가입 error:", error);
    throw new Error("회원가입 중 오류 발생");
  }
};


//[x]로그인
export const loginUser = async (email: string, password: string, autoLogin: boolean) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const selectUser = await prisma.users.findFirst({
        where: {
          email: email,
        },
      });

      if (!selectUser || selectUser.status === "inactive") {
        console.log("사용자를 찾을 수 없습니다.");
        throw { status: StatusCodes.UNAUTHORIZED, message: "사용자를 찾을 수 없습니다." };
      }

      const userUuid = selectUser.uuid;
      const selectUserSecret = await prisma.userSecrets.findFirst({
        where: {
          uuid: userUuid,
        },
      });

      if (!selectUserSecret) {
        console.log("사용자를 찾을 수 없습니다.");
        throw { status: StatusCodes.UNAUTHORIZED, message: "사용자를 찾을 수 없습니다." };
      }

      return { selectUser, selectUserSecret };
    });

    if (!result) {
      throw { status: StatusCodes.UNAUTHORIZED, message: "사용자를 찾을 수 없습니다." };
    }

    const { selectUser, selectUserSecret } = result;
    const isPasswordValid = await bcrypt.compare(password, selectUserSecret.hashPassword);

    if (!isPasswordValid) {
      throw new Error("사용자 정보가 일치하지 않습니다.");
    }

    const userUuidString = selectUser.uuid.toString("hex");
    const generalToken = jwt.sign(
      {
        uuid: userUuidString,
        email: selectUser.email
      }, process.env.PRIVATE_KEY_GEN as string, {
      expiresIn: process.env.GENERAL_TOKEN_EXPIRE_IN,
      issuer: "fefive"
    });

    let refreshToken: string | null = null;
    if (autoLogin === true) {
      refreshToken = jwt.sign(
        {
          uuid: userUuidString,
        }, process.env.PRIVATE_KEY_REF as string, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN,
        issuer: "fefive"
      }
      );

      console.log("refreshToken왜 안나오냐:", refreshToken);

    }

    return { generalToken, refreshToken, result, userUuidString };

  } catch (error) {
    console.log("로그인 error:", error);
    throw new Error("로그인 중 오류 발생");
  }
};


//[x] 자동로그인(리프레시 토큰 발급)
export const saveRefreshToken = async (uuid: string, refreshToken: string) => {
  try {
    const uuidBuffer = Buffer.from(uuid.replace(/-/g, ""), "hex");
    const selectUserSecrets = await prisma.userSecrets.findFirst({
      where: {
        uuid: uuidBuffer,
      },
    });

    const updateSecretUser = await prisma.userSecrets.update({
      data: {
        refreshToken: refreshToken
      },
      where: {
        userSecretId: selectUserSecrets?.userSecretId,
      },
    });

    return { selectUserSecrets, updateSecretUser };
  } catch (error) {
    console.log("자동로그인 error:", error);
    throw new Error("자동로그인 중 오류 발생");
  }
};


//[x] 리프레시 토큰을 통한 액세스 토큰 발급
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    //토큰 검증
    const decoded = jwt.verify(refreshToken, process.env.PRIVATE_KEY_REF as string) as jwt.JwtPayload;

    //사용자 정보 가져옴
    const uuidBuffer = Buffer.from(decoded.uuid.replace(/-/g, ""), "hex");
    const selectUser = await prisma.users.findFirst({
      where: {
        uuid: uuidBuffer,
      },
    });

    const selectUserSecrets = await prisma.userSecrets.findFirst({
      where: {
        uuid: uuidBuffer,
      },
    });

    if (!selectUser) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    if (!selectUserSecrets) {
      throw new Error("유효하지 않은 사용자입니다.");
    }

    //access token재발급
    const newAccessToken = jwt.sign(
      {
        uuid: decoded.uuid,
        email: selectUser.email
      }, process.env.PRIVATE_KEY_GEN as string, {
      expiresIn: process.env.GENERAL_TOKEN_EXPIRE_IN,
      issuer: "fefive"
    });

    return newAccessToken;

  } catch (error) {
    console.log("access token refresh error:", error);
    throw new Error("access token refresh 중 오류 발생");
  }
}

//[x] 로그아웃
export const logoutUser = async (uuid: string) => {
  try {
    const uuidBuffer = Buffer.from(uuid, "hex");

    const selectUserSecrets = await prisma.userSecrets.findFirst({
      where: {
        uuid: uuidBuffer,
      },
    });

    if (!selectUserSecrets) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    const updateUserSecrets = await prisma.userSecrets.update({
      data: {
        refreshToken: ""
      },
      where: {
        userSecretId: selectUserSecrets?.userSecretId,
      },
    });

    return console.log("로그아웃 성공");

  } catch (error) {
    console.log("로그아웃:", error);
    throw new Error("로그아웃 중 오류 발생");
  }
}


//[ ] 카카오 로그인
export const kakaoUser = async (email: string, nickname: string, accessToken: string, refreshToken: string, tokenExpiry: string) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const selectUser = await prisma.users.findFirst({
        where: {
          email: email
        }
      });

      if (!selectUser) {
        const uuid = uuidv4();
        const uuidBuffer = Buffer.from(uuid.replace(/-/g, ""), "hex");

        const createUser = await prisma.users.create({
          data: {
            uuid: uuidBuffer,
            email: email,
            nickname: nickname,
            authType: "kakao",
            status: "active",
          },
        });

        const createUserOauthSecret = await prisma.userOauthSecrets.create({
          data: {
            uuid: uuidBuffer,
            accessToken: accessToken,
            refreshToken: refreshToken,
            tokenExpiry: tokenExpiry,
          },
        });

        return { createUser, createUserOauthSecret };
      }

      return selectUser;
    });

    return result;

  } catch (error) {
    console.log("카카오로그인 error:", error);
    throw new Error("카카오로그인 중 오류 발생");
  }


}
