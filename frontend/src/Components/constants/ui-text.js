export const FOLLOW_BUTTON_TEXT = "Follow";
export const FOLLOWED_BUTTON_TEXT = "Followed";
export const REQUESTED_BUTTON_TEXT = "Requested";
export const returnFormattedDate = (rawDate) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const date = new Date(rawDate);
    const month = monthNames[date.getMonth()];
    return (
        {
            month: month,
            day: date.getDate(),
            year: date.getFullYear()
        }

    );
}