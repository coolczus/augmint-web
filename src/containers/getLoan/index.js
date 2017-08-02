import React from 'react'
import { Switch, Route } from 'react-router-dom'
import {PageHeader, Grid, Row, Col} from 'react-bootstrap';
import LoanSelector from './LoanSelector'
import NewLoan from './NewLoan'

const getLoanMain = () => (
    <div>
        <header>
            <PageHeader>
                Get a UCD loan
            </PageHeader>
        </header>
        <main>
            <Grid>
                <Row>
                    <Col>
                        <Switch>
                            <Route exact path='/getLoan' component={LoanSelector}/>
                            <Route path='/getLoan/:loanProductId' component={NewLoan}/>
                        </Switch>
                    </Col>
                </Row>
            </Grid>
        </main>
    </div>
)


export default getLoanMain