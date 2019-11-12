import React from "react";
import styled, { css } from "styled-components";
import { theme } from "common/theme";
import BaseComponent from "common/components/BaseComponent";

const Button = ({ children, ...rest }) => (
  <Wrapper as="button" {...rest}>
    <span>{children}</span>
  </Wrapper>
);

const Wrapper = styled(BaseComponent).attrs(({ type = "button" }) => ({
  type
}))`
  display: inline-block;
  height: 32px;
  padding: 0 15px;
  line-height: 30px;
  text-align: center;
  letter-spacing: normal;
  cursor: pointer;
  outline: 0;
  white-space: nowrap;
  color: ${theme.textColor};
  background: ${theme.primaryColor};
  border: 1px solid ${theme.primaryColor};
  border-radius: 0;

  &:hover {
    background: ${theme.textColor};
    color: ${theme.primaryColor};
  }

  ${({ disabled }) =>
    disabled &&
    css`
      && {
        cursor: default;
        background: ${theme.textColor};
        border-color: ${theme.dividerColor};
        color: ${theme.dividerColor};
      }
    `};

  ${({ primary }) =>
    primary &&
    css`
      && {
        background: ${theme.secondaryTextColor};
      }

      &:hover {
        background: ${theme.primaryTextColor};
        color: ${theme.textColor};
      }
    `};

  ${({ dashed }) =>
    dashed &&
    css`
      && {
        background: ${theme.textColor};
        border-color: ${theme.dividerColor};
        border: 1px dashed ${theme.lightPrimaryColor};
        color: ${theme.dividerColor};
      }

      &:hover {
        border-color: ${theme.accentColor};
        color: ${theme.accentColor};
      }
    `};

  ${({ rounded }) =>
    rounded &&
    css`
      && {
        border-radius: 4px;
      }
    `};

  ${({ block }) =>
    block &&
    css`
      && {
        display: block;
        width: 100%;
      }
    `};

  ${({ link }) =>
    link &&
    css`
      && {
        background: rgba(0, 0, 0, 0);
        border: 0;
        color: ${theme.primaryColor};
        text-decoration: underline;
      }

      &:hover {
        color: ${theme.accentColor};
      }
    `};

  ${({ ghost }) =>
    ghost &&
    css`
      && {
        background: rgba(0, 0, 0, 0);
      }
    `};
`;

export default Button;
