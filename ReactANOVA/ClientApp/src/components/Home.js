import React, { Component } from 'react';

export class Home extends Component {
    constructor(props) {
        super();
        this.state = {
            numDataSets: 2,
            data: [],
            formattedData: [],
            testStatistic: 0,
            degreesOfFreedom: 0,
            k: null,
            grandMean: null,
            meanSquareOfError: null,
            meanSquareOfTreatments: null,
            sumSquareOfError: null,
            sumSquareOfTreatments: null,
            fStatistic: null,
            dof1: null,
            dof2: null,
            pValue: null
        }
        this.renderDataSets = this.renderDataSets.bind(this);
        this.returnAnovaResults = this.returnAnovaResults.bind(this);
        this.addDataSet = this.addDataSet.bind(this);
        this.removeDataSet = this.removeDataSet.bind(this);
        this.updateData = this.updateData.bind(this);
    }

    renderDataSets() {
        var dataSetDOM = [];
        for (var i = 0; i < this.state.numDataSets; i++) {
            dataSetDOM.push(<DataSet index={i} key={i} dataToParent={this.updateData} />);
        }
        return dataSetDOM;
    }

    returnAnovaResults() {

        var fd = [...this.state.data];


        //Each dataset's input
        for (var i = 0; i < fd.length; i++) {

            //Remove consecutive commas
            fd[i] = fd[i].replace(/,{2,}/gi, ',');
            console.log(fd[i]);

            //Check for trailing commas.
            if (fd[i].slice(-1) === ',') {
                fd[i] = fd[i].slice(0,-1);
            }


            fd[i] = fd[i].split(",");
            //Parse each set's input.
            for (var j = 0; j < fd[i].length; j++) {
                fd[i][j] = parseFloat(fd[i][j]);
            }
        }
        this.setState({ formattedData: fd });

        fetch("/Anova/Post",
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fd)
            })
            .then((res) => { return res.json(); })
            .then((res => {
                console.log(res);

                this.setState({
                    grandMean: res.grandMean,
                    k: res.numDataSets,
                    sumSquareOfError: res.sumSquaredErrors,
                    sumSquareOfTreatments: res.sumOfSquaresForTreatment,
                    meanSquareOfError: res.meanSquareOfError,
                    meanSquareOfTreatments: res.meanSquareOftreatment,
                    dof1: res.degreesOfFreedomOne,
                    dof2: res.degreesOfFreedomTwo,
                    fStatistic: res.fStatistic,
                    pValue: res.pValue
                });
            }));
    }

    addDataSet() {
        var nds = this.state.numDataSets + 1;
        this.setState({ numDataSets: nds });
    }

    updateData(i, d) {
        var newData = this.state.data;
        newData[i] = d;
        this.setState({ data: newData });
        console.log(this.state.data);
    }

    removeDataSet() {
        var nds = this.state.numDataSets - 1;
        this.setState({ numDataSets: nds });
    }

    render() {
        return (
            <div>
                <Title />
                {this.renderDataSets()}
                <div className="offset-md-3 col-md-6 col-12 control-panel">
                    <button className="quantity-change-button" onClick={this.removeDataSet}>-</button>
                    <button className="quantity-change-button" onClick={this.addDataSet}>+</button>
                    <button className="submit-button" onClick={this.returnAnovaResults}>Analyze</button>
                </div>
                <div className="output-area">
                    <div className="output-header">
                        <p>Output</p>
                    </div>

                    <div className="row">
                        <div className="col-md-4 col-12">
                            <p className="answer-header">DOF1: </p>
                            <p className="answer-value">{this.state.dof1}</p>
                        </div>

                        <div className="col-md-4 col-12">
                            <p className="answer-header">DOF2: </p>
                            <p className="answer-value">{this.state.dof2}</p>
                        </div>

                        <div className="col-md-4 col-12">
                            <p className="answer-header">F-Statistic: </p>
                            <p className="answer-value">{this.state.fStatistic}</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 col-12">
                            <p className="answer-header">K: </p>
                            <p className="answer-value">{this.state.k}</p>
                        </div>

                        <div className="col-md-4 col-12">
                            <p className="answer-header">N: </p>
                            <p className="answer-value">{this.state.grandMean}</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 col-12">
                            <p className="answer-header">SSTr: </p>
                            <p className="answer-value">{this.state.sumSquareOfTreatments}</p>
                        </div>

                        <div className="col-md-4 col-12">
                            <p className="answer-header">SSE: </p>
                            <p className="answer-value">{this.state.sumSquareOfError}</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 col-12">
                            <p className="answer-header">MSE: </p>
                            <p className="answer-value">{this.state.meanSquareOfError}</p>
                        </div>

                        <div className="col-md-4 col-12">
                            <p className="answer-header">MSTr: </p>
                            <p className="answer-value">{this.state.meanSquareOfTreatments}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class Title extends Component {
    render() {
        return (
            <div>
                <h1 className="title-text-line-one col-md-6 offset-md-3 col-12">
                    React
            </h1>
                <h1 className="title-text col-md-6 offset-md-3 col-12">
                    A.N.O.V.A.
            </h1>
            </div>
        );
    }
}

class DataSet extends Component {

    constructor() {
        super();
        this.state = { value: "" };
        this.updateValue = this.updateValue.bind(this);
    }

    updateValue({ target }) {
        this.setState({ value: target.value });
        this.props.dataToParent(this.props.index, target.value);
    }

    render() {
        return (
            <div className="col-md-6 offset-md-3 col-12">
                <input className="dataset-input" placeholder="Enter data values here." type="text" onChange={this.updateValue}></input>
                <br />
            </div>
        );
    }
}
