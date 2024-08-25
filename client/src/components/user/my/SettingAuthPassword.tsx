import React, { useEffect } from "react";
import HeaderWithBackButton from "../../../components/common/HeaderWithBackButton";
import { useNavigate } from "react-router-dom";
import InputText from "../InputText";
import "../../../styles/scss/components/user/my/settingNickname.scss";
import { updateNickname } from "../../../api/user.api";
import { useForm } from "react-hook-form";

export interface SettingAuthPasswordProps {
  password: string;
}

const SettingAuthPassword = () => {
  const navigate = useNavigate();

  const {
    register,
    setFocus,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingAuthPasswordProps>();

  const handleNickname = (data: SettingAuthPasswordProps) => {
    const result = updateNickname(data);
    console.log("비밀번호 인증 성공:", result);

    navigate("/users/my");
  };

  useEffect(() => {
    setFocus("password");
  }, [setFocus]);

  return (
    <div className="setting-nickname-container">
      <HeaderWithBackButton />
      <form onSubmit={handleSubmit(handleNickname)}>
        <fieldset className="title">
          <p>비밀번호 확인</p>
          <InputText
            type="password"
            placeholder="비밀번호를 입력해주세요."
            {...register("password", {
              required: "비밀번호를 입력해주세요.",
            })}
          />
          {/* {errors.nickname && (
            <p className="error-message">{errors.nickname.message}</p>
          )} */}
        </fieldset>
        <button type="submit" className="complete-btn">
          완료
        </button>
      </form>
    </div>
  );
};

export default SettingAuthPassword;
