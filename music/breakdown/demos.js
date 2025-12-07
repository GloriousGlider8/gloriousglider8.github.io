const spotlightID = "pproj2"

const listFormatter = new Intl.ListFormat("en", {
	style: "short",
	type: "conjunction"
})

const getJSON = async url => {
  const response = await fetch(url)
  if(!response.ok)
    throw new Error(response.statusText)

  const data = response.json()
  return data
}

function formatDayMonthYear(input) {
	let [day, month, year] = input.split('/')
	month = parseInt(month, 10)
	const monthNames = [
		"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	]
	return `${day} ${monthNames[month - 1]} ${year}`
}

function dayMonthYearToUTCTimestamp(input) {
	let [day, month, year] = input.split('/')

	return Date.UTC(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10))
}

function convertMultiFormat(publishersStr, productsStr) {
	if (
		typeof publishersStr !== "string" ||
		typeof productsStr !== "string" ||
		!publishersStr.startsWith("!") ||
		!productsStr.startsWith("!")
	) {
		return null
	}

	publishersStr = publishersStr.slice(1)
	productsStr = productsStr.slice(1)

	const publishers = publishersStr.split(";").map(entry => {
		const [num, name] = entry.split(":")
		return { num: Number(num), name }
	})

	const products = productsStr.split(";").map(entry => {
		const [num, companyIndex, name] = entry.split(":")
		return {
			num: Number(num),
			companyIndex: Number(companyIndex),
			name
		}
	})

	const companyData = {}

	publishers.forEach(p => {
		companyData[p.name] = {}
	})

	products.forEach(p => {
		const company = publishers[p.companyIndex]?.name
		if (!company) return

		if (!companyData[company][p.name])
			companyData[company][p.name] = 0

		companyData[company][p.name] += p.num
	})

	return companyData
}

async function fetchWithProgress(url, onProgress) {
	const res = await fetch(url);
	if (!res.ok) throw new Error("Failed to download file");

	const contentLength = res.headers.get("Content-Length");
	const total = contentLength ? parseInt(contentLength, 10) : null;

	const reader = res.body.getReader();
	let loaded = 0;
	const chunks = [];

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		chunks.push(value);
		loaded += value.length;

		if (total) {
			onProgress(loaded / total);
		}
	}

	const blob = new Blob(chunks);
	const buf = await blob.arrayBuffer();
	return buf;
}

async function fetchAllCollections(collectionList) {
	const collectionSongURLNameLists = {};

	const collectionPromises = collectionList.map(async collectionID => {
		const buf = await fetchWithProgress(`/music/breakdown/${collectionID}.collection`, progress => {
			const percent = Math.round(progress * 10000) / 100;
			document.getElementById("dl-progress-2").value = percent;
			document.getElementById("dl-progress-text-2").innerHTML = `${percent}%`;
		});
		const stream = new KaitaiStream(buf);
		const collection = new Collection(stream);

		collectionSongURLNameLists[collectionID] = collection.songs.map(sng => ({
			name: sng.name,
			id: sng.id,
			date: sng.creationDdMmYyyy,
			href: `?d=true&c=${collectionID}&s=${sng.id}`
		}));
	});

	await Promise.all(collectionPromises);
	return collectionSongURLNameLists;
}

document.addEventListener("DOMContentLoaded", async (e) => {
	const params = new URLSearchParams(window.location.search)

	if (params.get("d") == "true") {
		//#region ?d=true
		for (const i of document.querySelectorAll(".hide-on-d")) {
			i.classList.add("hidden")
		}

		document.getElementById("active-track-title").innerHTML = "Fetching collection..."
		fetchWithProgress(`/music/breakdown/${params.get("c")}.collection`, progress => {
			const percent = Math.round(progress * 10000) / 100
			document.getElementById("dl-progress").value = percent
			document.getElementById("dl-progress-text").innerHTML = `${percent}%`
		})
		.catch(err => {
			document.getElementById("active-track-title").innerHTML = `${err}`
			document.getElementById("active-track-title").classList.add("text-red")
			throw new Error(err);
		})
		.then(buf1 => {
			const stream1 = new KaitaiStream(buf1)
			const collection = new Collection(stream1)

			document.getElementById("other-tracks").innerHTML = `Other Songs from ${collection.name}`
			for (const sng of collection.songs) {
				if (sng.id != params.get("s")) {
					const div = document.createElement("div")

					div.classList.add("song-listing")
					div.innerHTML = `<a href="?d=true&c=${params.get("c")}&s=${sng.id}"><img src="/assets/mus-cover.png" style="width: 175px;"></a>
										<h3 style="margin-top: 0;">${sng.name}</h3>`

					document.getElementById("other-songs").appendChild(div)
				}
			}
			document.getElementById("active-track-title").innerHTML = "Fetching song..."
			document.getElementById("dl-progress").value = 0
			document.getElementById("dl-progress-text").innerHTML = `0%`
			fetchWithProgress(`/music/breakdown/${params.get("c")}/${params.get("s")}.song`, progress => {
				const percent = Math.round(progress * 10000) / 100
				document.getElementById("dl-progress").value = percent
				document.getElementById("dl-progress-text").innerHTML = `${percent}%`
			})
			.catch(err => {
				document.getElementById("active-track-title").innerHTML = `${err}`
				document.getElementById("active-track-title").classList.add("text-red")
				throw new Error(err);
			})
			.then(buf => {
				document.getElementById("dl-progress-div").classList.add("hidden")
				document.getElementById("active-track-title").innerHTML = "Select a track to view more info and listen to audio demos."
				const stream = new KaitaiStream(buf)
				const song = new Song(stream)
				
				song.tracks.sort((a, b) => a.name.localeCompare(b.name))

				for (const s of collection.songs) {
					if (s.id == params.get("s")) {
						document.getElementById("song-name").innerHTML = s.name
						document.getElementById("song-data").innerHTML = `Created on ${formatDayMonthYear(s.creationDdMmYyyy)}<br/>
						${song.tracks.length} Tracks`
					}
				}

				//#region Construct Company Data
				const companyData = {}
				for (const t of song.tracks) {
					const multiFormat = convertMultiFormat(t.publisher, t.product)
					if (multiFormat) {
						let i = 0
						for (const productInfo of Object.values(multiFormat)) {
							const publisher = Object.keys(multiFormat)[i]
							let i1 = 0
							for (const product of Object.keys(productInfo)) {
								if (!companyData[publisher]) companyData[publisher] = {}
								if (!companyData[publisher][product]) companyData[publisher][product] = 0
								companyData[publisher][product] += Object.values(productInfo)[i1]
								i1++
							}
							i++
						}
					} else {
						if (!companyData[t.publisher]) companyData[t.publisher] = {}
						if (!companyData[t.publisher][t.product]) companyData[t.publisher][t.product] = 0
						companyData[t.publisher][t.product]++
					}

					const button = document.createElement("button")
					button.classList.add("track-play-option")
					button.type = "button"
					button.innerHTML = `${t.name}`
					button.id = `track-play-${t.id}`

					if (multiFormat) {
						button.isMulti = true
						button.hasEntered = false
						button.originalProduct = t.product
						button.companies = Object.keys(multiFormat)
						let p = []
						for (const prI of Object.values(multiFormat)) {
							p.push(...Object.keys(prI))
						}
						button.products = p
						button.innerHTML = `${t.name} (Multi)`
					} else {
						button.isMulti = false
						button.hasEntered = true
						button.originalProduct = t.product
					}

					document.getElementById("track-play").appendChild(button)
				}

				//#region Parse Data
				const colors = Highcharts.getOptions().colors

				const companiesSeries = []
				const productsSeries = []
				let colorIndex = 0

				for (const [company, products] of Object.entries(companyData)) {
					const companyColor = colors[colorIndex % colors.length]
					colorIndex++

					let companyTotal = 0
					for (const count of Object.values(products)) companyTotal += count

					companiesSeries.push({
						name: company,
						y: companyTotal,
						color: companyColor
					})

					const productNames = Object.keys(products)
					productNames.forEach((product, i) => {
						const count = products[product]
						const shade = Highcharts.color(companyColor).brighten(i * 0.35 - 0.1).get()
						productsSeries.push({
							name: product,
							y: count,
							color: shade
						})
						for (const child of document.getElementById("track-play").children) {
							for (const tr1 of song.tracks) {
								if (child.id.replace("track-play-", "") == tr1.id && child.isMulti && child.originalProduct == tr1.product && !child.hasEntered) {
									// Multi
									child.hasEntered = true
									child.style.color = `var(--text-800)`
									child.buttonColorBase = shade
									child.addEventListener("mouseover", (e) => {
										e.target.style.color = `var(--text-950)`
									})
									child.addEventListener("mouseleave", (e) => {
										e.target.style.color = `var(--text-800)`
									})
									child.onclick = function() {
										for (const child1 of document.getElementById("track-play").children) {
											child1.classList.remove("active")
										}
										child.classList.add("active")
										document.getElementById("active-track-title").innerHTML = `${tr1.name}`
										document.getElementById("active-track-info").innerHTML = `Companies: ${listFormatter.format(child.companies)}<br/>
										Products: ${listFormatter.format(child.products)}<br/>
										Paths: ${tr1.path}<br/>
										Patches: ${tr1.patch}<br/>
										See the <a href="https://docs.google.com/spreadsheets/d/1V8ezfXa3onBlYWn9u0hCywrLDq2F5Hn6spx33JiPFXY">spreadsheet</a> for more details.`

										let blob
										if (tr1.compressed) {
											blob = new Blob([fflate.decompressSync(tr1.content)], { type: tr1.mimetype })
										} else {
											blob = new Blob([tr1.content], { type: tr1.mimetype });
										}
										const url = URL.createObjectURL(blob);
										const audplayer = document.getElementById("audio-track")
										audplayer.src = url
										audplayer.load()
										audplayer.classList.remove("hidden")
									}
								} else if (child.id.replace("track-play-", "") == tr1.id && tr1.product == product) {
									// Single
									child.style.color = `color-mix(in oklab, ${shade} 75%, var(--text-600) 25%)`
									child.buttonColorBase = shade
									child.addEventListener("mouseover", (e) => {
										e.target.style.color = `${shade}`
									})
									child.addEventListener("mouseleave", (e) => {
										e.target.style.color = `color-mix(in oklab, ${shade} 75%, var(--text-600) 25%)`
									})
									child.onclick = function() {
										for (const child1 of document.getElementById("track-play").children) {
											child1.classList.remove("active")
										}
										child.classList.add("active")
										document.getElementById("active-track-title").innerHTML = `${tr1.name}`
										document.getElementById("active-track-info").innerHTML = `Company: ${tr1.publisher}<br/>
										Product: ${tr1.product}<br/>
										Path: ${tr1.path}<br/>
										Patch: ${tr1.patch}<br/>
										See the <a href="https://docs.google.com/spreadsheets/d/1V8ezfXa3onBlYWn9u0hCywrLDq2F5Hn6spx33JiPFXY">spreadsheet</a> for more details.`

										let blob
										if (tr1.compressed) {
											blob = new Blob([fflate.decompressSync(tr1.content)], { type: tr1.mimetype })
										} else {
											blob = new Blob([tr1.content], { type: tr1.mimetype });
										}
										const url = URL.createObjectURL(blob);
										const audplayer = document.getElementById("audio-track")
										audplayer.src = url
										audplayer.load()
										audplayer.classList.remove("hidden")
									}
								}
							}
						}
					})
				}

				//#region VST Usage in this Song
				Highcharts.chart('current-chart-cont', {
					chart: { type: 'pie' },
					title: { text: 'VST Usage in this Song' },
					series: [
						{
							name: 'Uses',
							colorByPoint: true,
							data: companiesSeries,
							size: '35%',
							dataLabels: {enabled: false}
						},
						{
							name: 'Uses',
							data: productsSeries,
							size: '70%',
							innerSize: '54%',
							dataLabels: {enabled: true}
						}
					]
				})
			})
		})
	} else {
		//#region ?d=false
		for (const i of document.querySelectorAll(".hide-on-no-d")) {
			i.classList.add("hidden")
		}

		getJSON("/music/breakdown/collections.json").then(cjson => {
		const collectionList = cjson

		document.getElementById("dl-status-2").innerHTML = "Fetching collections..."
		document.getElementById("dl-progress-2").value = 0
		document.getElementById("dl-progress-text-2").innerHTML = `0%`
		fetchWithProgress(`/music/breakdown/${spotlightID}.collection`, progress => {
			const percent = Math.round(progress * 10000) / 100
			document.getElementById("dl-progress-2").value = percent
			document.getElementById("dl-progress-text-2").innerHTML = `${percent}%`
		})
		.catch(err => {
			document.getElementById("dl-status-2").innerHTML = `${err}`
			document.getElementById("dl-status-2").classList.add("text-red")
			throw new Error(err);
		})
		.then(buf1 => {
			const stream1 = new KaitaiStream(buf1)
			const collection = new Collection(stream1)
			
			document.getElementById("other-tracks").innerHTML = `In the Spotlight: ${collection.name}`

			for (const sng of collection.songs) {
				const div = document.createElement("div")

				div.classList.add("song-listing")
				div.innerHTML = `<a href="?d=true&c=${spotlightID}&s=${sng.id}"><img src="/assets/mus-cover.png" style="width: 175px;"></a>
									<h3 style="margin-top: 0;">${sng.name}</h3>`

				document.getElementById("other-songs").appendChild(div)
			}

		fetchAllCollections(collectionList).then(collectionSongURLNameLists => {
		document.getElementById("dl-status-2").innerHTML = "Building graph..."

		//#region Build Graph Series

		let graphSeries = []
		console.log(graphSeries)

		//#region VST Usage Over Time
		Highcharts.chart("over-time-graph", {
			chart: { type: "area" },
			title: { text: "VST Usage Over Time" },

			xAxis: {
				type: "datetime",
				title: { text: "Date" }
			},

			plotOptions: {
				series: {
					label: {
						style: {
							fontSize: '1.4em',
							opacity: 0.4
						}
					}
				},
				area: {
					stacking: 'percent',
					marker: { enabled: false }
				}
			},

			series: graphSeries
		})
		})
		})
		})
	}
})