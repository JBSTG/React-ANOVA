import React, { Component } from 'react';

export class Home extends Component {
    constructor(props) {
        super();
        this.state = {
            numDataSets: 2,
            data: [],
            formattedData:[],
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
            pValue:null
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
        for (var i = 0; i < fd.length; i++) {
            fd[i] = fd[i].split(",");
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
                <button onClick={this.removeDataSet}>-</button>
                <button onClick={this.addDataSet}>+</button>
                <button onClick={this.returnAnovaResults}>Analyze</button>
                <p>Output</p>
                <p>F-Statistic: {this.state.fStatistic}</p>
                <p>K: {this.state.k}</p>
                <p>N: {this.state.grandMean}</p>
                <p>DOF1: {this.state.dof1}</p>
                <p>DOF2: {this.state.dof2}</p>
                <p>SSE: {this.state.sumSquareOfError}</p>
                <p>SSTr: {this.state.sumSquareOfTreatments}</p>
                <p>MSE: {this.state.meanSquareOfError}</p>
                <p>MSTr: {this.state.meanSquareOfTreatments}</p>
            </div>
        );
    }
}

class Title extends Component {
    render() {
        return (
            <h1>React ANOVA</h1>
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
            <div>
                <input type="text" onChange={this.updateValue}></input>
                <br />
            </div>
        );
    }
}
