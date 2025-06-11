class InvestmentService {
  calculate(contractAmount: number, taxRate: number, downPaymentRatio: number, 
           fundRate: number, loanRate: number, holdingYears: number, holdingIncome: number) {

    console.log('parse values:', {
      contractAmount,
      taxRate,
      downPaymentRatio,
      fundRate,
      loanRate,
      holdingYears,
      holdingIncome
    });

    const loanAmount = contractAmount * (1 - downPaymentRatio);
    const paidTax = contractAmount * taxRate;
    const downPayment = contractAmount * downPaymentRatio;
    const fundCost = downPayment * fundRate * holdingYears;
    const totalInterest = loanAmount * loanRate * holdingYears;
    const totalHoldingIncome = holdingIncome * holdingYears;
    const totalCost = paidTax + downPayment + fundCost + totalInterest - totalHoldingIncome;

    return {
      paidTax,
      downPayment,
      fundCost,
      totalInterest,
      totalHoldingIncome,
      totalCost
    };
  }
}

Component({
  lifetimes: {
    attached() {
      console.log('Component attached with initial data:', this.data);
    }
  },
    data: {
      contractAmount: 0,      // 合同金额
      taxRate: '1',          // 契税税率(%)
      downPaymentRatio: '30',  // 首付比例(%)
      fundRate: '2',         // 资金利率(%)
      loanRate: '3',         // 贷款利率(%)
      holdingYears: 1,        // 持有年限
      holdingIncome: 0,       // 持有收益
      
      paidTax: null as number | null,          // 已缴契税
      downPayment: null as number | null,      // 首付金额
      fundCost: null as number | null,         // 资金成本
      totalInterest: null as number | null,    // 总利息
      totalHoldingIncome: null as number | null, // 持有收益
      totalCost: null as number | null,        // 总成本
      holdingCost: null as number | null,      // 持有成本
      breakevenLine: null as number | null,    // 保本线
      showResult: false
  },

  methods: {
    onContractAmountChange(e: any) {
      this.setData({
        contractAmount: parseFloat(e.detail.value) || 0
      });
    },

    onTaxRateChange(e: any) {
      this.setData({
        taxRate: e.detail.value
      });
    },

    onDownPaymentRatioChange(e: any) {
      this.setData({
        downPaymentRatio: e.detail.value
      });
    },

    onFundRateChange(e: any) {
      this.setData({
        fundRate: e.detail.value
      });
    },

    onLoanRateChange(e: any) {
      this.setData({
        loanRate: e.detail.value
      });
    },

    onHoldingYearsChange(e: any) {
      this.setData({
        holdingYears: parseFloat(e.detail.value) || 1
      });
    },

    onHoldingIncomeChange(e: any) {
      this.setData({
        holdingIncome: parseFloat(e.detail.value) || 0
      });
    },

    calculate() {
      const {
        contractAmount,
        taxRate,
        downPaymentRatio,
        fundRate,
        loanRate,
        holdingYears,
        holdingIncome
      } = this.data;

      console.log('Input values:', {
        contractAmount,
        taxRate,
        downPaymentRatio,
        fundRate,
        loanRate,
        holdingYears,
        holdingIncome
      });

      // 确保所有输入值有效
      const parsedTaxRate = parseFloat(taxRate) / 100;
      const parsedDownPaymentRatio = parseFloat(downPaymentRatio) / 100;
      const parsedFundRate = parseFloat(fundRate) / 100;
      const parsedLoanRate = parseFloat(loanRate) / 100;

      console.log('Parsed values:', {
        parsedTaxRate,
        parsedDownPaymentRatio, 
        parsedFundRate,
        parsedLoanRate
      });

      const result = new InvestmentService().calculate(
        contractAmount,
        parsedTaxRate,
        parsedDownPaymentRatio,
        parsedFundRate,
        parsedLoanRate,
        holdingYears,
        holdingIncome
      );

      // 确保计算结果有效
      const validatedResult = {
        paidTax: isNaN(result.paidTax) ? 0 : result.paidTax,
        downPayment: isNaN(result.downPayment) ? 0 : result.downPayment,
        fundCost: isNaN(result.fundCost) ? 0 : result.fundCost,
        totalInterest: isNaN(result.totalInterest) ? 0 : result.totalInterest,
        totalHoldingIncome: isNaN(result.totalHoldingIncome) ? 0 : result.totalHoldingIncome
      };

      console.log('Validated results:', validatedResult);

      // 设置所有数据和显示标志
      this.setData({
        paidTax: result.paidTax,
        downPayment: result.downPayment,
        fundCost: result.fundCost,
        totalInterest: result.totalInterest,
        totalHoldingIncome: result.totalHoldingIncome,
        totalCost: result.totalCost,
        holdingCost: result.paidTax + result.fundCost + result.totalInterest - result.totalHoldingIncome,
        breakevenLine: contractAmount + (result.paidTax + result.fundCost + result.totalInterest - result.totalHoldingIncome),
        showResult: true
      }, () => {
        console.log('UI should show:', {
          paidTax: (this.data.paidTax ?? 0).toFixed(2) + '元',
          downPayment: (this.data.downPayment ?? 0).toFixed(2) + '元',
          fundCost: (this.data.fundCost ?? 0).toFixed(2) + '元',
          totalInterest: (this.data.totalInterest ?? 0).toFixed(2) + '元',
          totalHoldingIncome: (this.data.totalHoldingIncome ?? 0).toFixed(2) + '元'
        });
        
        // 检查DOM元素
        const query = wx.createSelectorQuery().in(this);
        query.select('#paidTax').boundingClientRect();
        query.select('#downPayment').boundingClientRect();
        query.exec(res => {
          console.log('DOM elements:', res);
        });
      });
    }
  }
});
