import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import useImmer from '../../common/hooks/useImmer';
import { validateInputValue } from '../../common/validation/inputValidation';
import InputGroup from '../../common/ui/InputGroup';
import Button from '../../common/ui/Button';

const StyledAuth = styled.div`
  margin: 5em auto;
  width: 90%;
  max-width: var(--mw-modal);
`;

const initialState = {
  email: {
    inputType: 'input',
    config: {
      type: 'email',
      label: 'Email',
      placeholder: 'johndoe@youremail.com',
    },
    value: '',
    validation: {
      required: true,
      isEmail: true,
    },
    touched: false,
    valid: false,
  },
  password: {
    inputType: 'input',
    config: {
      type: 'text',
      label: 'Password',
      placeholder: 'Your Burger Builder password',
    },
    value: '',
    validation: {
      required: true,
      minLength: 6,
    },
    touched: false,
    valid: false,
  },
};

function Auth() {
  const [controls, updateControls] = useImmer(initialState);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const allGood = Object.keys(controls).every((k) => controls[k].valid);
    setIsFormValid(allGood);
  }, [controls]);

  const handleInputChange = (e, k) => {
    const isValid = validateInputValue(e.target.value, controls[k].validation);
    updateControls((draft) => {
      draft[k].value = e.target.value;
      draft[k].valid = isValid;
      draft[k].touched = true;
    });
  };

  const inputControls = Object.entries(controls).map(([k, v]) => (
    <InputGroup
      key={k}
      inputType={v.inputType}
      config={v.config}
      valid={v.valid}
      onChange={(e) => handleInputChange(e, k)}
      touched={v.touched}
      value={v.value}
    />
  ));

  return (
    <StyledAuth>
      <form>
        {inputControls}
        <Button variant="success" disabled={!isFormValid}>
          Sign Up
        </Button>
      </form>
    </StyledAuth>
  );
}

export default Auth;
