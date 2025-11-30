function loadRatingIcons() {
	document.querySelectorAll(".star-rating").forEach(rating => {
		let value = parseFloat(rating.getAttribute("rating"))

		const text = document.createElement("p")
		if (value in [0, 1, 2, 3, 4, 5]) {
			text.innerText = `${value}.0 `
		} else {
			text.innerText = `${value} `
		}
		
		for (let i = 0; i < 5; i++) {
			const child = document.createElement("i")

			if (value == 0.5) {
				child.classList.add("fa-solid")
				child.classList.add("fa-star-half-stroke")
				value -= 0.5
			} else if (value > 0.5) {
				child.classList.add("fa-solid")
				child.classList.add("fa-star")
				value -= 1
			} else {
				child.classList.add("fa-regular")
				child.classList.add("fa-star")
			}
			text.appendChild(child)
		}
		rating.appendChild(text)

	})
}