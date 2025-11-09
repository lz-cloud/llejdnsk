import { forwardRef, useMemo, useState } from 'react';
import { Input } from 'antd';
import type { ComponentProps, ReactNode } from 'react';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

export type PasswordInputProps = ComponentProps<typeof Input>;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ suffix, ...rest }, ref) => {
  const [visible, setVisible] = useState(false);

  const toggleIcon = useMemo(() => (
    <span
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => setVisible((prev) => !prev)}
      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
    >
      {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
    </span>
  ), [visible]);

  const mergedSuffix = useMemo(() => {
    if (!suffix) {
      return toggleIcon;
    }

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {suffix as ReactNode}
        {toggleIcon}
      </span>
    );
  }, [suffix, toggleIcon]);

  return (
    <Input
      {...rest}
      ref={ref}
      type={visible ? 'text' : 'password'}
      suffix={mergedSuffix}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
