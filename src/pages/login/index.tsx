import { AuthPage } from "@refinedev/antd";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      rememberMe={false}
      forgotPasswordLink={false}
      registerLink={false}
      title={
        <div>
          <img
            alt=""
            src={"https://static.stakestone.io/stone/logo/stone-icon-b.svg"}
            width={30}
            height={30}
          />{" "}
          CeDeFi Manager
        </div>
      }
      formProps={{
        initialValues: { email: "", password: "" },
      }}
    />
  );
};
