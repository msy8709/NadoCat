import { httpClient } from "../api/http";
import { SignupProps } from "../pages/user/Signup";
import { LoginProps } from "../pages/user/Login";
import {SettingNicknameProps} from "../components/user/my/SettingNickname";
import { SettingAuthPasswordProps } from "../components/user/my/SettingAuthPassword";
import { SettingPasswordProps } from "../components/user/my/SettingPassword";
import { SettingDetailProps } from "../components/user/my/SettingDetail";
// import  {Post}  from "../pages/MyPage";

export const signup = async (userData: SignupProps) => {
  try {
    const response = await httpClient.post("/users/signup", userData);
    return response.data;
  } catch (error) {
    console.error("signup error:", error);
    throw error;
  }
};

interface ILoginResponse {
  message: string;
  user: {
    email: string;
    nickname: string;
    uuid: string;
    status: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const login = async (data: LoginProps) => {
  try {
    const response = await httpClient.post<ILoginResponse>(
      "/users/login",
      data
    );
    return response.data;
  } catch (error) {
    console.error("login error:", error);
    throw error;
  }
};

export const logout = async (uuid: string) => {
  try {
    const response = await httpClient.post("/users/logout", {uuid}); // uuid를 올바른 JSON 형식으로 전송
    return response.data;
  } catch (error) {
    console.error("login error:", error);
    throw error;
  }
};

//사용자 프로필
export const userPage = async (userUuid: string) => {
  try {
    // const response = await httpClient.get(`/users/my`);
    const response = await httpClient.get(`/users/user/${userUuid}`);
    return response.data;
  } catch (error) {
    console.error("사용자 프로필 정보를 가져오는 데 실패했습니다:", error);
    throw error;
  }
};

//내 마이페이지
export const myPage = async () => {
  try {
    // const response = await httpClient.get(`/users/my`);
    const response = await httpClient.get(`/users/my`);
    return response.data;
  } catch (error) {
    console.error("마이페이지 정보를 가져오는 데 실패했습니다:", error);
    throw error;
  }
};


export const myInterests = async () => {
  try {
    const response = await httpClient.get(`/users/my/interests`);
    return response.data;
  }catch (error) {
    console.error("관심글 정보를 가져오는 데 실패했습니다:", error);
    throw error;
  }
}


//이미지
export const uploadProfile = async (file: File) => {
  const formData = new FormData();
  formData.append("profileImage", file);

  try {
    const response = await httpClient.post("/users/update-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.imageUrl;
  } catch (error) {
    console.error("프로필 사진 정보를 가져오는 데 실패했습니다:", error);
    throw error;
  }
};

export const deleteProfile = async (imageUrl: string) => {
  try {
    const response = await httpClient.put("/users/delete-profile", {
      imageUrl,
    });
    return response.data;
  } catch (error) {
    console.error("기본 사진 정보를 가져오는 데 실패했습니다:", error);
    throw error;
  }
};

//세팅
export const updateNickname = async (data: SettingNicknameProps) => {
  try {
    const response = await httpClient.put("/users/my/setting/nickname", data);
    return response.data;
  } catch (error) {
    console.error("닉네임 업데이트에 실패했습니다:", error);
    throw error;
  }
};

export const authPassword = async (data: SettingAuthPasswordProps) => {
  try {
    const response = await httpClient.post("/users/my/setting/auth-password", data);
    return response.data;
  } catch (error) {
    console.error("사용자 비밀번호 인증에 실패했습니다:", error);
    throw error;
  }
};

export const updatePassword = async (data: SettingPasswordProps) => {
  try {
    const response = await httpClient.put("/users/my/setting/password", data);
    return response.data;
  } catch (error) {
    console.error("비밀번호 업데이트에 실패했습니다:", error);
    throw error;
  }
};

export const updateDetail = async (data: SettingDetailProps) => {
  try {
    const response = await httpClient.put("/users/my/setting/detail", data);
    return response.data;
  } catch (error) {
    console.error("자기소개 업데이트에 실패했습니다:", error);
    throw error;
  }
};


export const deleteUser = async (uuid: string) => {
  try {
    const response = await httpClient.put("/users/my/setting/delete-user", {uuid});
    return response.data;
  } catch (error) {
    console.error("회원탈퇴에 실패했습니다:", error);
    throw error;
  }
}; 