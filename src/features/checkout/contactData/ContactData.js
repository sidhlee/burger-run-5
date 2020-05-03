import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import axios from '../../../common/axios-orders';
import Axios from 'axios';

import Button from '../../../common/ui/Button';
import Spinner from '../../../common/ui/Spinner';
import InputGroup from '../../../common/ui/InputGroup';
import useImmer from '../../../common/hooks/useImmer';
import initialOrderForm from './initialOrderForm';
import { validateInputValue } from '../../../common/validation/inputValidation';
import withErrorHandler from '../../../common/hoc/withErrorHandler';

ContactData.propTypes = {
  className: PropTypes.string.isRequired,
};

function ContactData({
  className,
  ingredients,
  price,
  history,
  orderBurger,
  idToken,
  userId,
  email,
}) {
  // rendering starts
  const [isLoading, setIsLoading] = useState(false);
  const [orderForm, updateOrderForm] = useImmer(initialOrderForm);
  const [isFormValid, setIsFormValid] = useState(false);
  const sourceRef = useRef(Axios.CancelToken.source());
  // effect function will run after ContactData return + DOM update
  useEffect(() => {
    updateOrderForm((d) => {
      d.email.value = email;
      d.email.touched = true;
      d.email.valid = true;
    });
  }, [updateOrderForm, email]);
  useEffect(() => {
    const isFormValid = Object.keys(orderForm).reduce(
      (isValid, field) => isValid && orderForm[field].valid,
      true
    );
    setIsFormValid(isFormValid); // this will trigger re-render
    return () => {
      sourceRef.current.cancel(); // cancel pending request on component unmount
    };
  }, [orderForm]); // will run whenever orderForm is updated.

  // only this handler function will run from the latest render scope
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = Object.keys(orderForm).reduce((data, inputField) => {
      data[inputField] = orderForm[inputField].value;
      return data;
    }, {});
    const order = {
      ingredients,
      price,
      customer: formData,
      localId: userId,
    };
    sourceRef.current = Axios.CancelToken.source();
    (async () => {
      const thrown = await orderBurger(order, sourceRef.current, idToken);
      if (!thrown) {
        setIsLoading(false);
        history.push('/');
      }
    })();
    setIsLoading(false);
  };

  const handleInputChange = (value, inputField) => {
    const isValid = validateInputValue(value, orderForm[inputField].validation);
    updateOrderForm((draft) => {
      draft[inputField].value = value;
      draft[inputField].touched = true;
      draft[inputField].valid = isValid;
    });
  };

  const inputObjects = Object.keys(orderForm).map((inputField) => ({
    inputField,
    ...orderForm[inputField],
  }));

  const inputs = inputObjects.map((o, i) => (
    <InputGroup
      key={o.inputField}
      inputType={o.inputType}
      config={o.config}
      value={o.value}
      onChange={(e) => handleInputChange(e.target.value, o.inputField)}
      touched={o.touched}
      valid={o.valid}
      autoFocus={i === 0}
    />
  ));

  return (
    <>
      {isLoading ? <Spinner show={isLoading} /> : null}
      <div className={className}>
        <h2>Order Form</h2>
        <form onSubmit={handleFormSubmit}>
          {inputs}
          <Button
            className="order-form__button"
            variant="success"
            disabled={!isFormValid}
          >
            Order
          </Button>
        </form>
      </div>
    </>
  );
}

const StyledContactData = styled(ContactData)`
  ${(props) => css`
    width: 80%;
    max-width: 500px;
    margin: 0 auto;
    h2 {
      text-align: center;
    }
    .order-form__button {
      margin-bottom: 2em;
    }
  `}
`;

export default withErrorHandler(StyledContactData, axios);
