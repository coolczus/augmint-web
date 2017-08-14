/*
TODO: form client side validation. UCD balance check, address format check, number  format check
TODO: input formatting: decimals, thousand separators
TODO: solidity tx  error handling transferUcdTx() - requires  change in transfer() fx in contract
  */

import React from "react";
import {
    FormGroup,
    InputGroup,
    ControlLabel,
    Button,
    Col
} from "react-bootstrap";
import store from "store.js";
import {
    EthSubmissionErrorPanel,
    EthSubmissionSuccessPanel
} from "components/MsgPanels";
import { Field, reduxForm, SubmissionError } from "redux-form";
import { FieldInput, Form } from "components/BaseComponents";
import { transferUcd, TOKENUCD_TRANSFER_SUCCESS } from "modules/tokenUcd";
import BigNumber from "bignumber.js";
//import BigNumber from "bignumber.js";

class UcdTransferForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { result: null };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async handleSubmit(values) {
        // this.setState({
        //     result: null
        // });
        console.log("handleSubmit start");
        let amount;
        try {
            amount = new BigNumber(values.ucdAmount);
        } catch (error) {
            throw new SubmissionError({
                _error: {
                    title: "Invalid amount",
                    details: error
                }
            });
        }

        let res = await store.dispatch(transferUcd(values.payee, amount));
        console.log("handleSubmit res received:", res);
        if (res.type !== TOKENUCD_TRANSFER_SUCCESS) {
            throw new SubmissionError({
                _error: {
                    title: "Ethereum transaction Failed",
                    details: res.error,
                    eth: res.eth
                }
            });
        } else {
            this.setState({
                result: res.result
            });
            return;
        }
    }

    render() {
        const {
            error,
            handleSubmit,
            pristine,
            submitting,
            submitSucceeded,
            clearSubmitErrors,
            reset
        } = this.props;

        return (
            <Form horizontal onSubmit={handleSubmit(this.handleSubmit)}>
                <fieldset disabled={submitting}>
                    <legend>Send UCD</legend>

                    {error &&
                        <EthSubmissionErrorPanel
                            error={error}
                            collapsible={false}
                            onDismiss={() => clearSubmitErrors()}
                        />}

                    {submitSucceeded &&
                        <EthSubmissionSuccessPanel
                            header={<h3>Successful transfer</h3>}
                            eth={this.state.result.eth}
                            onDismiss={() => reset()}
                        />}

                    {!submitSucceeded &&
                        <div>
                            <FormGroup controlId="ucdAmount">
                                <Col componentClass={ControlLabel} sm={2}>
                                    Amount:{" "}
                                </Col>
                                <Col sm={10}>
                                    <InputGroup>
                                        <Field
                                            name="ucdAmount"
                                            component={FieldInput}
                                            type="number"
                                        />
                                        <InputGroup.Addon>UCD</InputGroup.Addon>
                                    </InputGroup>
                                </Col>
                            </FormGroup>

                            <FormGroup controlId="payee">
                                <Col componentClass={ControlLabel} sm={2}>
                                    To:{" "}
                                </Col>
                                <Col sm={10}>
                                    <Field
                                        name="payee"
                                        component={FieldInput}
                                        type="text"
                                        placeholder="0x0..."
                                    />
                                </Col>
                            </FormGroup>

                            <FormGroup>
                                <Col smOffset={2} sm={10}>
                                    <Button
                                        type="submit"
                                        bsSize="large"
                                        bsStyle="primary"
                                        disabled={pristine}
                                    >
                                        {submitting
                                            ? "Submitting..."
                                            : "Transfer"}
                                    </Button>
                                </Col>
                            </FormGroup>
                        </div>}
                </fieldset>
            </Form>
        );
    }
}

export default reduxForm({
    form: "UcdTransferForm"
})(UcdTransferForm);