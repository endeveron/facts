export const removeSensitiveData = (user) => {
    const { password, ...newAccountData } = user.account;
    return {
        id: user._id.toString(),
        account: newAccountData,
    };
};
