import styles from './num-input-decimal.module.scss';
import React, { BaseSyntheticEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import * as _ from 'lodash';
import { cssPick } from '../../util/css.ts';
import { usePrevious } from '../../hooks/usePrevious.tsx';
import { SldDecimal } from '../../util/decimal.ts';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';

type IProps = {
  originDecimal: number;
  onChange?: (value: SldDecimal | null) => void;
  doChangeIfError?: boolean;
  onErrorChange?: (isError: boolean, errType?: ErrorType | null) => void;
  onFocus?: (isFocus: boolean) => void;

  isDark?: boolean;
  noBorder?: boolean;
  align?: 'left' | 'right';
  className?: string;
  inputClassName?: string;
  parentClassName?: string;
  banDefaultStyle?: boolean;
  forceError?: boolean;
  disabled?: boolean;

  prefix?: ReactNode;
  suffix?: ReactNode;
  placeholder?: string;

  value?: SldDecimal | null;
  min?: SldDecimal;
  minIllegal?: boolean;
  max?: SldDecimal;
  maxIllegal?: boolean;
  mustInt?: boolean;
  fix?: number;
  allowNegative?: boolean;
  highlight?: boolean;
};
type ValueCondition = {
  value?: SldDecimal | null;
  min?: SldDecimal;
  minIllegal?: boolean;
  max?: SldDecimal;
  maxIllegal?: boolean;
  mustInt?: boolean;
  fix?: number;
  decimal: number;
};
enum ErrorType {
  NaN = 'NaN',
  Max = 'Max',
  Min = 'Min',
  Dec = 'Decimal',
}

export function DecimalNumInput(props: IProps) {
  const { onErrorChange, onFocus, onChange } = props;
  const onChangeRef = useRef(onChange);
  const onErrorChangeRef = useRef(onErrorChange);
  const onFocusRef = useRef(onFocus);

  const [isFocus, setIsFocus] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);

  const [valueCondition, setValueCondition] = useState<ValueCondition | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputString, setInputString] = useState<string>();
  const [outputValue, setOutputValue] = useState<SldDecimal | null | undefined>(undefined);
  const styleMr = useStyleMr(styles);
  const valueConditionRef = useRef<ValueCondition | null>(valueCondition);

  const checkValue = (condition: ValueCondition): null | ErrorType | ValueCondition => {
    if (!condition.value) {
      return null;
    }

    if (condition.decimal !== condition.value.getOriginDecimal()) {
      return ErrorType.Dec;
    }

    if (condition.max) {
      const isErr = condition.maxIllegal
        ? condition.value.toE18() >= condition.max.toE18()
        : condition.value.toE18() > condition.max.toE18();
      if (isErr) {
        return ErrorType.Max;
      }
    }

    if (condition.min) {
      const isErr = condition.minIllegal
        ? condition.value.toE18() <= condition.min.toE18()
        : condition.value.toE18() < condition.min.toE18();

      if (isErr) {
        return ErrorType.Min;
      }
    }

    return condition;
  };

  const updateCondition = (props: IProps): void => {
    const condition: ValueCondition = {
      value: props.value,
      min: props.min,
      minIllegal: props.minIllegal,
      max: props.max,
      maxIllegal: props.maxIllegal,
      mustInt: props.mustInt,
      fix: props.fix,
      decimal: props.originDecimal,
    };

    setValueCondition(condition);
  };

  const updateErrorState = useCallback((newErrorType: ErrorType | null) => {
    const isNowError: boolean = newErrorType !== null;

    setIsError(isNowError);
    setErrorType(newErrorType);

    if (onErrorChangeRef.current) {
      onErrorChangeRef.current(isNowError, newErrorType);
    }
  }, []);

  const syncCorrectValueString = useCallback((valueString: string) => {
    if (inputRef.current) {
      if (inputRef.current.value === valueString) {
        return;
      }

      inputRef.current.value = valueString;
      inputRef.current.type = 'text';
      inputRef.current.selectionStart = valueString.length;
      inputRef.current.type = 'number';
    }
  }, []);

  const syncValueString = useCallback(
    (nextValue: SldDecimal | null) => {
      if (inputRef.current) {
        const curValueString: string = inputRef.current.value;
        if ((nextValue?.toNumeric() || '') === curValueString) {
          return;
        }

        if (nextValue === null) {
          syncCorrectValueString('');
          return;
        }

        const curValue = SldDecimal.fromNumeric(curValueString, props.originDecimal);
        if (curValue.toE18() == nextValue.toE18() && curValueString !== '') {
          return;
        }

        syncCorrectValueString(nextValue.toNumeric(true));
      }
    },
    [syncCorrectValueString, props.originDecimal],
  );

  const correctValue = useCallback(
    (valueString: string): string => {
      valueString = valueString.toLowerCase();
      let finalValString: string | null = null;

      // check e
      if (valueString.toLowerCase().indexOf('e') >= 0) {
        finalValString = valueString.replace('e', '');
        syncCorrectValueString(finalValString);
        return finalValString;
      }

      // check negative
      if (props.allowNegative !== true) {
        if (valueString.indexOf('-') >= 0) {
          finalValString = valueString.replace('-', '');
          syncCorrectValueString(finalValString);
          return finalValString;
        }
      }

      // check integer
      if (props.mustInt || props.fix === 0) {
        const parts = valueString.split('.');
        finalValString = parts[0];

        if (finalValString !== valueString) {
          syncCorrectValueString(finalValString);
          return finalValString;
        }
      }

      if (valueString.startsWith('0') && valueString.indexOf('.') < 0) {
        const parts: string[] = valueString.split('.');
        const intPart = _.trimStart(parts[0], '0');
        const intPartStr = intPart.length === 0 ? '0' : intPart;

        let finalStr = valueString;
        if (parts[1]) {
          finalStr = intPartStr + '.' + parts[1];
        } else {
          finalStr = intPartStr;
        }

        if (finalStr !== valueString) {
          syncCorrectValueString(finalStr);
          return finalStr;
        }
      }

      // check decimal
      const fixDecimal: number = props.fix !== undefined ? Math.min(props.fix, props.originDecimal) : props.originDecimal;

      if (valueString.indexOf('.') >= 0) {
        const parts = valueString.split('.');
        let int: string = parts[0];
        const dec: string = parts.length > 1 ? parts[1] : '';

        if (int.startsWith('0')) {
          int = _.trimStart(int, '0');
          if (int.length === 0) {
            int = '0';
          }
        }

        finalValString = int;

        if (dec.length > 0) {
          if (dec.length > fixDecimal) {
            finalValString += '.' + dec.substring(0, fixDecimal);
          } else {
            finalValString += '.' + dec;
          }
        }

        if (finalValString !== valueString) {
          syncCorrectValueString(finalValString);
          return finalValString;
        }
      }

      return valueString;
    },
    [props.allowNegative, props.mustInt, props.fix, props.originDecimal, syncCorrectValueString],
  );

  // 初始化
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
    };

    const inputEl = inputRef.current;

    // disableWheel
    if (inputEl) {
      inputEl.addEventListener('wheel', onWheel);
    }

    updateCondition(props);

    return () => {
      if (inputEl) {
        inputEl.removeEventListener('wheel', onWheel);
      }
    };
  }, []);

  useEffect(() => {
    valueConditionRef.current = valueCondition;
  }, [valueCondition]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onErrorChangeRef.current = onErrorChange;
  }, [onErrorChange]);

  useEffect(() => {
    onFocusRef.current = onFocus;
  }, [onFocus]);

  // watch output
  useEffect(() => {
    if (outputValue === undefined) {
      return;
    }

    if (onChangeRef.current) {
      onChangeRef.current(outputValue);
    }
  }, [outputValue]);

  useEffect(() => {
    // check value condition
    if (!valueCondition) {
      return;
    }

    const checkResult: null | ErrorType | ValueCondition = checkValue(valueCondition);

    if (checkResult === null || _.has(checkResult, 'value')) {
      updateErrorState(null);
      syncValueString(valueCondition.value || null);
    }
    //
    else if (checkResult === ErrorType.Dec) {
      console.warn(`Input Decimal Error: need ${valueCondition.decimal} got ${valueCondition.value?.getOriginDecimal()} `);
      if (valueCondition.value) {
        const newVal = SldDecimal.fromE18(valueCondition.value.toE18(), valueCondition.decimal);
        setOutputValue(newVal);

        valueCondition.value = newVal;
      }
    }
    //
    else if (checkResult === ErrorType.Min || checkResult === ErrorType.Max) {
      syncValueString(valueCondition.value!);
      updateErrorState(checkResult as ErrorType);
    }
    //
    else {
      updateErrorState(checkResult as ErrorType);
    }
    //
  }, [valueCondition, updateErrorState, syncValueString]);

  useEffect(() => {
    const curCondition = valueConditionRef.current;

    if (inputString == undefined || !curCondition) {
      return;
    }

    const newValue: SldDecimal | null = inputString === '' ? null : SldDecimal.fromNumeric(inputString, curCondition.decimal);
    const newCondition: ValueCondition = Object.assign({}, curCondition, { value: newValue });
    const checkResult2: null | ErrorType | ValueCondition = checkValue(newCondition);

    //
    if (checkResult2 === null || _.has(checkResult2, 'value')) {
      updateErrorState(null);
      setOutputValue(newCondition.value || null);
    } else {
      updateErrorState(checkResult2 as ErrorType);

      if (props.doChangeIfError) {
        setOutputValue(newCondition.value || null);
      }
    }
  }, [inputString, props.doChangeIfError, updateErrorState]);

  const prevProps = usePrevious(props);

  useEffect(() => {
    if (prevProps === props) {
      return;
    }

    const {
      value: prevValue,
      max: prevMax,
      min: prevMin,
      maxIllegal: prevMaxIllegal,
      minIllegal: prevMinIllegal,
      mustInt: prevMustInt,
      fix: prevFix,
      originDecimal: prevOriginDecimal,
    } = prevProps || {};

    const isSameValue: boolean = prevValue === props.value || (!!prevValue && !!props.value && prevValue.eq(props.value));
    const isSameMax: boolean = prevMax === props.max || (!!prevMax && !!props.max && prevMax.eq(props.max));
    const isSameMin: boolean = prevMin === props.min || (!!prevMin && !!props.min && prevMin.eq(props.min));

    const isValue = !isSameValue;
    const isMax = !isSameMax;
    const isMin = !isSameMin;
    const isMaxIllegal = prevMaxIllegal !== props.maxIllegal;
    const isMinIllegal = prevMinIllegal !== props.minIllegal;
    const isMustInt = prevMustInt !== props.mustInt;
    const isFixChange = prevFix !== props.fix;
    const isDecimalChange = prevOriginDecimal !== props.originDecimal;

    if (isValue || isMax || isMin || isMaxIllegal || isMinIllegal || isMustInt || isFixChange || isDecimalChange) {
      updateCondition(props);
    }
  }, [props, prevProps]);

  const onValueChange = useCallback(
    (event: BaseSyntheticEvent) => {
      const form = (event.nativeEvent as InputEvent).target as HTMLInputElement;
      const inputString: string = form.value;

      const corrected: string = correctValue(inputString);

      setInputString(corrected);
    },
    [correctValue],
  );

  const onInputFocus = useCallback((isFocus: boolean) => {
    setIsFocus(isFocus);

    if (onFocusRef.current) {
      onFocusRef.current(isFocus);
    }
  }, []);

  const hasPrefix: boolean = !!props.prefix;
  const hasSuffix: boolean = !!props.suffix;

  const darkCss: string = cssPick(!!props.isDark, styles.dark);
  const activeCss: string = cssPick(isFocus, styles.active);
  const alignCss: string = props.align === 'right' ? styles.pullRight : styles.pullLeft;
  const errorCss: string = cssPick(props.forceError || isError, styles.error);
  const noBorderCss: string = props.noBorder === true ? styles.noBorder : '';
  const highlightCss: string = cssPick(!!props.highlight, styles.highlight);

  const content = (
    <div
      className={styleMr(
        'sld_dec_num_input',
        cssPick(isFocus, 'sld_dec_num_input_active'),
        cssPick(props.forceError || isError, 'sld_dec_num_input_error'),
        cssPick(!props.banDefaultStyle, styles.wrapperDecimal),
        noBorderCss,
        highlightCss,
        darkCss,
        activeCss,
        errorCss,
        props.className,
      )}
    >
      {hasPrefix && <div className={styleMr(styles.prefix, 'sld_input_prefix')}>{props.prefix}</div>}

      <input
        ref={inputRef}
        className={styleMr(
          styles.input,
          darkCss,
          alignCss,
          'sld_input',
          props.inputClassName,
          cssPick(props.align === 'right', 'sld_input_pull_right'),
          cssPick(props.align !== 'right', 'sld_input_pull_left'),
        )}
        type={'number'}
        onFocus={() => onInputFocus(true)}
        onBlur={() => onInputFocus(false)}
        disabled={props.disabled}
        placeholder={props.placeholder}
        onChange={onValueChange}
      />

      {hasSuffix && <div className={styleMr(styles.suffix, 'sld-input-suffix')}>{props.suffix}</div>}
    </div>
  );

  return props.parentClassName ? <div className={props.parentClassName}>{content}</div> : <>{content}</>;
}
