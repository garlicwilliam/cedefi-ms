import { SafeMultisigTransactionResponse } from '@safe-global/types-kit';
import { Descriptions, Modal, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import styles from './SafePending.module.scss';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { StyleMerger } from '../../util/css.ts';
import { shortHex } from '../../util/string.ts';
import { Typography } from 'antd';
import { useSmall } from '../../hooks/useSmall.tsx';
const { Paragraph } = Typography;

export type SafePendingProps = {
  safeTx: SafeMultisigTransactionResponse | null;
  onClose?: () => void;
  isOpen?: boolean;
};

export const SafePending = ({ safeTx, onClose, isOpen }: SafePendingProps) => {
  const styleMr: StyleMerger = useStyleMr(styles);
  const isSmall: boolean = useSmall();

  if (!safeTx) {
    return <></>;
  }

  const onCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal maskClosable={false} open={!!safeTx && isOpen} footer={null} width={isSmall ? '85%' : 450} onCancel={onCancel}>
      <div className={styleMr(styles.safeCard)}>
        {/**/}
        <div className={styleMr(styles.iconBox)}>
          {safeTx.isExecuted ? (
            safeTx.isSuccessful ? (
              <CheckCircleOutlined className={styleMr(styles.resultDone)} />
            ) : (
              <CloseCircleOutlined className={styleMr(styles.resultErr)} />
            )
          ) : (
            <>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} />} size="large" />
              <div className={styleMr(styles.inner)}>
                <img src={'/svg/safe.svg'} width={24} height={24} alt="" />
              </div>
            </>
          )}
        </div>

        <Descriptions
          title={<div style={{ textAlign: 'center' }}>Safe Wallet Transaction Pending</div>}
          column={1}
          size={'small'}
          className={styleMr('sssss')}
        >
          <Descriptions.Item label="Safe Account">
            <div className={styleMr(styles.descValue)}>
              <Paragraph copyable={{ tooltips: false, text: safeTx.safe }}> {shortHex(safeTx.safe, 8, 8)} </Paragraph>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Safe Tx">
            <div className={styleMr(styles.descValue)}>
              <Paragraph copyable={{ tooltips: false, text: safeTx.data }}>{shortHex(safeTx.data || '', 12, 10)}</Paragraph>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Nonce">
            <div className={styleMr(styles.descValue)}>
              <Paragraph copyable={{ tooltips: false, text: safeTx.nonce }}>{safeTx.nonce}</Paragraph>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label={`Signed (${safeTx.confirmations?.length}/${safeTx.confirmationsRequired})`}>
            <div className={styleMr(styles.descValue)}>
              <div className={styleMr(styles.ownerList)}>
                {safeTx.confirmations?.map((one) => {
                  return (
                    <div>
                      <Paragraph copyable={{ tooltips: false, text: one.owner }}>{shortHex(one.owner, 8, 8)}</Paragraph>
                    </div>
                  );
                })}
              </div>
            </div>
          </Descriptions.Item>
        </Descriptions>

        <div></div>
      </div>
    </Modal>
  );
};
