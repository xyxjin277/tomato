// index.ts
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

class TaxService {
  static defaultRates = {
    vat: 0.05,       // 增值税5%
    incomeTax: 0.01, // 个税1%
    deedTax: 0.03,   // 契税3%
    buyerAgentFee: 0.01, // 买方中介费1%
    sellerAgentFee: 0.01  // 卖方中介费1%
  }

  static defaultPayers = {
    vat: 0,       // 0-卖方承担
    incomeTax: 0, // 0-卖方承担  
    deedTax: 1    // 1-买方承担
  }

  calculate(contractPrice: number, taxPayers: {vat: number, incomeTax: number, deedTax: number, buyerAgentFee: number, sellerAgentFee: number}, taxRates?: {vat: number, incomeTax: number, deedTax: number, buyerAgentFee: number, sellerAgentFee: number}) {
    const rates = taxRates || TaxService.defaultRates
    const { vat, incomeTax, deedTax, buyerAgentFee, sellerAgentFee } = rates

    // 计算各项税费
    const taxes = {
      vat: contractPrice * vat,
      incomeTax: contractPrice * incomeTax,
      deedTax: contractPrice * deedTax,
      buyerAgentFee: contractPrice * buyerAgentFee, // 买方中介费
      sellerAgentFee: contractPrice * sellerAgentFee // 卖方中介费
    }
    console.log(taxPayers)
    // 分配税费
    const sellerTaxes = {
      vat: taxPayers.vat === 0 ? taxes.vat : 0,
      incomeTax: taxPayers.incomeTax === 0 ? taxes.incomeTax : 0,
      deedTax: taxPayers.deedTax === 0 ? taxes.deedTax : 0,
      agentFee: taxPayers.sellerAgentFee === 0 ? taxes.sellerAgentFee : 0
    }

    const buyerTaxes = {
      vat: taxPayers.vat === 1 ? taxes.vat : 0,
      incomeTax: taxPayers.incomeTax === 1 ? taxes.incomeTax : 0,
      deedTax: taxPayers.deedTax === 1 ? taxes.deedTax : 0,
      agentFee: taxPayers.buyerAgentFee === 1 ? taxes.buyerAgentFee : 0
    }
    console.log("buyerTaxes", buyerTaxes, "sellerTaxes", sellerTaxes)
    // 计算净收入/总支出
    const sellerNetAmount = contractPrice - 
      sellerTaxes.vat - sellerTaxes.incomeTax - sellerTaxes.deedTax - sellerTaxes.agentFee

    const buyerTotalCost = contractPrice + 
      buyerTaxes.vat + buyerTaxes.incomeTax + buyerTaxes.deedTax + buyerTaxes.agentFee

    return {
      sellerTaxes,
      buyerTaxes,
      taxes,
      sellerNetAmount: this.round(sellerNetAmount),
      buyerTotalCost: this.round(buyerTotalCost)
    }
  }

  round(value: number) {
    return Math.round(value * 100) / 100
  }
}

Component({
  data: {
    contractAmount: 0,
    showResult: false,
    taxRates: {
      vat: 0.05,       // 增值税5%
      incomeTax: 0.01, // 个税1%
      deedTax: 0.03,   // 契税3%
      buyerAgentFee: 0.01, // 买方中介费1%
      sellerAgentFee: 0.01  // 卖方中介费1%
    },
    taxPayers: {
      vat: 0,       // 0-卖方承担
      incomeTax: 0, // 0-卖方承担
      deedTax: 1,   // 1-买方承担
      buyerAgentFee: 1, // 1-买方承担
      sellerAgentFee: 0  // 0-卖方承担
    },
    payerOptions: ['卖方承担', '买方承担'],
    sellerTaxes: {
      vat: 0,
      incomeTax: 0,
      deedTax: 0,
      agentFee: 0
    },
    buyerTaxes: {
      vat: 0,
      incomeTax: 0,
      deedTax: 0,
      agentFee: 0
    },
    sellerNetAmount: 0,
    buyerTotalCost: 0
  },

  methods: {
    onInputAmount(e: any) {
      this.setData({
        contractAmount: parseFloat(e.detail.value) || 0
      })
    },

    // 承担方选择变化事件
    onVatPayerChange(e: any) {
      this.setData({
        'taxPayers.vat': parseInt(e.detail.value)
      })
    },
    
    onIncomeTaxPayerChange(e: any) {
      this.setData({
        'taxPayers.incomeTax': parseInt(e.detail.value)
      })
    },
    
    onDeedTaxPayerChange(e: any) {
      this.setData({
        'taxPayers.deedTax': parseInt(e.detail.value)
      })
    },

    // 税率变化事件
    onVatRateChange(e: any) {
      const value = e.detail.value;
      if (value === '') {
        this.setData({'taxRates.vat': 0.05});
      } else {
        const num = parseFloat(value) || 0;
        this.setData({
          'taxRates.vat': parseFloat((num / 100).toFixed(4))
        });
      }
    },

    onIncomeTaxRateChange(e: any) {
      const value = e.detail.value;
      if (value === '') {
        this.setData({'taxRates.incomeTax': 0.01});
      } else {
        const num = parseFloat(value) || 0;
        this.setData({
          'taxRates.incomeTax': parseFloat((num / 100).toFixed(4))
        });
      }
    },

    onDeedTaxRateChange(e: any) {
      const value = e.detail.value;
      if (value === '') {
        this.setData({'taxRates.deedTax': 0.03});
      } else {
        const num = parseFloat(value) || 0;
        this.setData({
          'taxRates.deedTax': parseFloat((num / 100).toFixed(4))
        });
      }
    },

    // 中介费率变化事件
    onBuyerAgentFeeRateChange(e: any) {
      const value = e.detail.value;
      if (value === '') {
        this.setData({'taxRates.buyerAgentFee': 0.01});
      } else {
        const num = parseFloat(value) || 0;
        this.setData({
          'taxRates.buyerAgentFee': parseFloat((num / 100).toFixed(4))
        });
      }
    },

    onSellerAgentFeeRateChange(e: any) {
      const value = e.detail.value;
      if (value === '') {
        this.setData({'taxRates.sellerAgentFee': 0.01});
      } else {
        const num = parseFloat(value) || 0;
        this.setData({
          'taxRates.sellerAgentFee': parseFloat((num / 100).toFixed(4))
        });
      }
    },

    // 中介费承担方变化事件
    onBuyerAgentFeePayerChange(e: any) {
      this.setData({
        'taxPayers.buyerAgentFee': parseInt(e.detail.value)
      })
    },

    onSellerAgentFeePayerChange(e: any) {
      this.setData({
        'taxPayers.sellerAgentFee': parseInt(e.detail.value)
      })
    },

    calculate() {
      const amount = this.data.contractAmount
      if (!amount || amount <= 0) {
        wx.showToast({ title: '请输入有效金额', icon: 'none' })
        return
      }

      const result = new TaxService().calculate(amount, this.data.taxPayers, this.data.taxRates)
      this.setData({
        ...result,
        showResult: true
      })
    }
  }
})
