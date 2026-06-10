export const anatomyParts = [
  {
    key: "body",
    title: "Two body sections",
    summary:
      "A spider's body splits into the cephalothorax (head + thorax) and the abdomen, joined by a narrow waist. Unlike insects, spiders have no wings and no antennae.",
    points: [
      "Cephalothorax carries the eyes, fangs, pedipalps and all eight legs",
      "Abdomen houses the internal organs and silk glands",
      "Relative size of the two parts is a top identification signal",
    ],
  },
  {
    key: "legs",
    title: "Eight legs, seven segments",
    summary:
      "Each leg has seven segments — coxa, trochanter, femur, patella, tibia, metatarsus and tarsus — and does far more than walk.",
    points: [
      "Legs detect vibration, capture prey and aid climbing",
      "Spiders have no muscles to extend legs — they use hydraulic pressure",
      "Length, thickness and stance separate hunters from web-builders",
    ],
  },
  {
    key: "eyes",
    title: "Up to eight eyes",
    summary:
      "Most spiders have eight eyes, but ability varies enormously. Their number and arrangement is a key feature for AI identification.",
    points: [
      "Jumping spiders see colour and fine detail with two huge eyes",
      "Web-builders rely mostly on sensing vibration",
      "A brown recluse breaks the rule with six eyes in three pairs",
    ],
  },
  {
    key: "patterns",
    title: "Markings that matter",
    summary:
      "Body markings are often the fastest way to flag a high-risk species — and the model weighs them heavily.",
    points: [
      "A red hourglass underneath points to a black widow",
      "A violin shape on the back hints at a brown recluse",
      "Banded legs, spots and a cross are common, telling patterns",
    ],
  },
];

export const webTypes = [
  {
    name: "Orb web",
    desc: "The classic circular wheel of garden spiders — sticky spokes radiating from a hub.",
    spiders: "Garden & golden orb-weavers",
  },
  {
    name: "Funnel web",
    desc: "A flat sheet leading to a tube-shaped retreat at ground level where the spider waits.",
    spiders: "Funnel weavers, hobo spider",
  },
  {
    name: "Sheet web",
    desc: "Dense, flat horizontal layers, sometimes with a tangle of threads above to knock prey down.",
    spiders: "Sheet weavers",
  },
  {
    name: "Cobweb",
    desc: "An irregular three-dimensional tangle built into corners — messy but highly effective.",
    spiders: "House spiders, widows",
  },
];
