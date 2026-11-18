const calculateRefund = (amountPaid, appointmentTime, cancellationTime = new Date()) => {
    const apptTime = new Date(appointmentTime);
    const cancelTime = new Date(cancellationTime);

    const msDifference = apptTime.getTime() - cancelTime.getTime();
    const hoursDifference = msDifference / (1000 * 60 * 60);

    let refundPercentage = 0;

    if (hoursDifference > 48) {
        refundPercentage = 1.0; // 100%
    } else if (hoursDifference >= 24 && hoursDifference <= 48) {
        refundPercentage = 0.5; // 50%
    } else {
        refundPercentage = 0; // 0%
    }

    // Return both percentage and calculated amount formatted to 2 decimal places
    return {
        percentage: refundPercentage * 100,
        amount: parseFloat((amountPaid * refundPercentage).toFixed(2))
    };
};

module.exports = { calculateRefund };