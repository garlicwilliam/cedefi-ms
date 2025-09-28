import { Button, Form, Input, message } from "antd";
import { AuthSimpleResponse, restService } from "../../service/rest.service.ts";
import { AUTH_TOKEN_STORAGE_NAME } from "../../const.ts";
import { firstValueFrom } from "rxjs";
import { useNotification } from "@refinedev/core";
import { useForm } from "@refinedev/antd";

export const ModifyPass = () => {
  const [messageApi, messageCtx] = message.useMessage();
  const { open } = useNotification();
  const { form } = useForm();

  return (
    <div style={{ margin: "0 auto", maxWidth: "400px", paddingTop: "50px" }}>
      {messageCtx}
      <Form
        form={form}
        labelCol={{ span: 6 }}
        style={{ maxWidth: "400px" }}
        onFinish={async (values: any) => {
          if (values.newPassword.length < 6) {
            messageApi.warning("密码长度至少6个字符");
            return;
          }

          if (values.confirmPassword !== values.newPassword) {
            messageApi.warning("两次输入的密码不一致");
            return;
          }

          const token: string | null = localStorage.getItem(
            AUTH_TOKEN_STORAGE_NAME,
          );

          if (token) {
            const res: AuthSimpleResponse = await firstValueFrom(
              restService.authPassword(
                values.oldPassword,
                values.newPassword,
                token,
              ),
            );

            if (res.isOK) {
              form.resetFields();
              open?.({
                type: "success",
                message: "密码修改成功",
                description: "请使用新密码重新登录",
              });
            } else {
              open?.({
                type: "error",
                message: "密码修改失败",
                description: res.message || "请稍后再试",
              });
            }
          }
        }}
      >
        <Form.Item
          label={"原密码"}
          name={"oldPassword"}
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label={"新密码"}
          name={"newPassword"}
          rules={[
            { required: true, message: "新密码不能为空" },
            { min: 6, message: "长度至少6个字符" },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label={"确认密码"}
          name={"confirmPassword"}
          rules={[
            { required: true, message: "请再次输入新密码" },
            { min: 6, message: "长度至少6个字符" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error("两次输入密码必须相同!"));
              },
            }),
          ]}
          dependencies={["newPassword"]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            设置密码
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
