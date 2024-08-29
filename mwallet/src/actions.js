export const litActionA = `(async () => {
  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain: "ethereum",
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: "0x49C2E4DB36D3AC470ad072ddC17774257a043097",
      },
    },
  ];

  const testResult = await Lit.Actions.checkConditions({
    conditions: accessControlConditions,
    authSig: JSON.parse(authSig),
    chain: "ethereum",
  });

  if (!testResult) {
    LitActions.setResponse({
      response: "Address is not authorized",
    });
    return;
  }

  LitActions.setResponse({
    response: "true",
  });
})();
`;

export const litActionB = `(async () => {
  const accessControlConditions = [
    {
      contractAddress: "",
      standardContractType: "",
      chain: "ethereum",
      method: "",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: "=",
        value: "0xe8FA5C28CA55B1DFBb6BCDBAcE5A6F22F487d662",
      },
    },
  ];

  const testResult = await Lit.Actions.checkConditions({
    conditions: accessControlConditions,
    authSig: JSON.parse(authSig),
    chain: "ethereum",
  });

  if (!testResult) {
    LitActions.setResponse({
      response: "Address is not authorized",
    });
    return;
  }

  LitActions.setResponse({
    response: "true",
  });
})();
`;