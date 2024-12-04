import ButtonComponent from "@/components/Button";
import Page from "@/components/Page";
import { textColor } from "@/constants/functions";
import {
  CellRegex,
  ContentRegex,
  RowRegex,
  Number4Regex,
  AthleteTableRegex,
  TableRegex,
  CellRegex2,
  CarrotRegex,
  IdRegex,
  DivRegex,
  DateRegex,
} from "@/constants/regex";
import { Wedstrijd } from "@/constants/types";
import { getItem } from "@/utils/AsyncStorage";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  Text,
  useColorScheme,
  Animated,
  ScrollView,
  View,
  ColorSchemeName,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";

export default function Club() {
  const [schema, setSchema] = useState("");
  const [wedstrijden, setWedstrijden] = useState([] as Wedstrijd[]);

  useEffect(() => {
    const getS = async () => {
      const date = new Date();
      const weekNo = getWeekNumber(date);
      const res = await (
        await fetch(
          `https://www.b-b-z.nl/training/schema/?jaar=2024&week=${weekNo}`
        )
      ).text();
      const contentDiv = res.match(ContentRegex)![0];
      const trs = contentDiv.match(RowRegex)!;
      const tdMatch = trs.find((tr) =>
        tr.includes(
          `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
        )
      );
      if (tdMatch) {
        const id = tdMatch.match(CellRegex)![2].match(Number4Regex)![0];
        const schemaPage = await (
          await fetch(
            `https://www.b-b-z.nl/training/schema/?actie=bekijk&id=${id}`
          )
        ).text();
        const contentDiv = schemaPage
          .match(ContentRegex)![0]
          .replace(/&#8243;/g, '"')
          .replace(/&#8217;/g, "'")
          .replace(/&#8221;/g, "'")
          .replace(/&#8242/g, '"');
        const schema = contentDiv.split("<br />");
        schema.splice(0, 1);
        schema.splice(schema.length - 1, 1);
        setSchema(schema.join(""));
      }
    };
    const getW = async () => {
      const wedstrijdenPage = await (
        await fetch("https://www.b-b-z.nl/kalender/?actie=volledig")
      ).text();
      const table = wedstrijdenPage.match(TableRegex)![0];
      const rows = table
        .match(RowRegex)!
        .map((row) => {
          return row
            .match(CellRegex2)
            ?.filter((m) => m != null)
            .map((m) => m.replace(/<td>/g, "").replace(/<\/td>/g, ""))
            .filter((m) => m.length > 0)
            .map((m) => {
              // return m.includes("<a")
              //   ? m.match(CarrotRegex)![0].replace(/>/g, "").replace(/</g, "")
              //   : m;
              if (m.includes("<a")) {
                let r = m
                  .match(CarrotRegex)![0]
                  .replace(/>/g, "")
                  .replace(/</g, "");
                if (m.includes("?id=")) {
                  r += "SPLITHERE";
                  r += m.match(IdRegex)![0].replace("?id=", "");
                }
                return r;
              }
              return m;
            });
        })
        .filter((s) => s != null)
        .map((w) =>
          w.length > 6
            ? ({
                startDate: new Date(
                  new Date(w[0]).setHours(parseInt(w[5][0] + w[5][1]))
                ),
                endDate: new Date(w[1]),
                name: w[2].split("SPLITHERE")[0],
                location: w[3],
                country: w[4],
                category: w[6],
                id: w[2].split("SPLITHERE")[1],
              } as Wedstrijd)
            : ({
                startDate: new Date(
                  new Date(w[0]).setHours(parseInt(w[4][0] + w[4][1]))
                ),
                name: w[1].split("SPLITHERE")[0],
                location: w[2],
                country: w[3],
                category: w[5],
                id: w[1].split("SPLITHERE")[1],
              } as Wedstrijd)
        );
      setWedstrijden(rows);
    };
    getS();
    getW();
  }, []);

  const colorScheme = useColorScheme();

  return (
    <Page>
      <SchemaComponent colorScheme={colorScheme} schema={schema} />
      <WedstrijdenComponent
        colorScheme={colorScheme}
        wedstrijden={wedstrijden}
      />
    </Page>
  );
}

// Helper function to get week number (can be placed outside the component)
function getWeekNumber(date: Date): number {
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  const currentDay = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - currentDay);

  // Get first day of year
  const yearStart = new Date(date.getFullYear(), 0, 1);
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  date.setDate(date.getDate() - 4 + currentDay);
  return weekNo;
}

function SchemaComponent({
  schema,
  colorScheme,
}: {
  schema: string;
  colorScheme: ColorSchemeName;
}) {
  const [isExpanded, setExpanded] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const heightAnim = useState(new Animated.Value(0))[0];

  const currentDate = new Date();

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  const toggleExpand = () => {
    setExpanded(!isExpanded);

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: isExpanded ? 200 : 500,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <Pressable
      style={{
        width: Dimensions.get("window").width,
        borderColor: "#ef8b22",
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 20,
        overflow: "hidden",
        marginVertical: 10,
      }}
      onPress={toggleExpand}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ ...textColor(colorScheme) }}>
          Schema van{" "}
          {`${currentDate.getDate()}-${
            currentDate.getMonth() + 1
          }-${currentDate.getFullYear()}`}
        </Text>
        <Animated.View style={{ transform: [{ rotate }], marginLeft: 10 }}>
          <FontAwesome
            name="arrow-right"
            size={15}
            color={colorScheme === "dark" ? "#fff" : "#000"}
          />
        </Animated.View>
      </View>

      <Animated.View
        style={{
          maxHeight: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1000],
          }),
          opacity: heightAnim,
          marginTop: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
          }),
        }}
      >
        <Text style={textColor(colorScheme)}>{schema}</Text>
      </Animated.View>
    </Pressable>
  );
}

function WedstrijdenComponent({
  colorScheme,
  wedstrijden,
}: {
  colorScheme: ColorSchemeName;
  wedstrijden: Wedstrijd[];
}) {
  const [isExpanded, setExpanded] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const heightAnim = useState(new Animated.Value(0))[0];
  const [modalShown, setModalShown] = useState(false);
  const [selectedWedstrijd, setSelectedWedstrijd] = useState({} as Wedstrijd);
  const [loading, setLoading] = useState(false);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  const toggleExpand = () => {
    setExpanded(!isExpanded);

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: isExpanded ? 200 : 500,
        useNativeDriver: false,
      }),
    ]).start();
  };
  if (wedstrijden.length > 0) {
    return (
      <>
        <Modal
          visible={modalShown}
          animationType="slide"
          transparent
          onRequestClose={() => setModalShown(false)}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View
              style={{
                backgroundColor: colorScheme === "dark" ? "#2a3137" : "#f3f5f6",
                height: 200,
                width: 400,
                padding: 20,
                borderRadius: 10,
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ ...textColor(colorScheme), fontWeight: "bold" }}>
                  {selectedWedstrijd.name}
                </Text>
                <Text style={{ ...textColor(colorScheme), fontWeight: "bold" }}>
                  {!selectedWedstrijd.endDate
                    ? selectedWedstrijd.startDate?.toLocaleDateString()
                    : `${selectedWedstrijd.startDate?.toLocaleDateString()} - ${selectedWedstrijd.endDate?.toLocaleDateString()}`}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ ...textColor(colorScheme), fontWeight: "bold" }}>
                  {`${selectedWedstrijd.location} - ${selectedWedstrijd.country}`}
                </Text>
                <Text
                  style={{
                    ...textColor(colorScheme),
                    fontWeight: "bold",
                  }}
                >
                  {selectedWedstrijd.category}
                </Text>
              </View>

              <View style={{ height: 10 }} />
              <ButtonComponent onPress={() => setModalShown(false)}>
                <Text>Sluit</Text>
              </ButtonComponent>
            </View>
          </View>
        </Modal>

        <Pressable
          style={{
            width: Dimensions.get("window").width,
            borderColor: "#ef8b22",
            borderWidth: 1,
            borderRadius: 6,
            paddingVertical: 10,
            paddingHorizontal: 20,
            overflow: "hidden",
            marginVertical: 10,
          }}
          onPress={toggleExpand}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ ...textColor(colorScheme) }}>Wedstrijden</Text>
            <Animated.View style={{ transform: [{ rotate }], marginLeft: 10 }}>
              <FontAwesome
                name="arrow-right"
                size={15}
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </Animated.View>
          </View>

          <Animated.View
            style={{
              maxHeight: heightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1000],
              }),
              opacity: heightAnim,
              marginTop: heightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 10],
              }),
            }}
          >
            {wedstrijden.slice(0, 10).map((wedstrijd, i) => (
              <Pressable
                key={i}
                onPress={async (e) => {
                  e.stopPropagation();
                  //TODO: Create modal on press, add Inschrijven knop, figure out where data gets send to
                  setSelectedWedstrijd(wedstrijd);
                  setLoading(true);
                  const w = await getWe(wedstrijd.id);
                  // setModalShown(true);
                }}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  borderColor: "grey",
                  borderWidth: 1,
                  borderRadius: 6,
                  paddingHorizontal: 5,
                  marginHorizontal: 5,
                  paddingVertical: 10,
                  marginVertical: 5,
                }}
              >
                <Text
                  style={{
                    ...textColor(colorScheme),
                    textAlign: "left",
                    flex: 1.5,
                  }}
                  numberOfLines={1}
                >
                  {wedstrijd.name}
                </Text>
                {loading && selectedWedstrijd.id === wedstrijd.id && (
                  <ActivityIndicator color="#ef8b22" />
                )}
                <Text
                  style={{
                    ...textColor(colorScheme),
                    textAlign: "center",
                    flex: 1.5,
                  }}
                >
                  {wedstrijd.startDate.toLocaleDateString()}
                </Text>
                <Text
                  style={{
                    ...textColor(colorScheme),
                    textAlign: "right",
                    flex: 1.5,
                  }}
                >
                  {wedstrijd.location}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </Pressable>
      </>
    );
  } else return <ActivityIndicator color="#ef8b22" />;
}

async function getWe(id: string) {
  const w = {} as Wedstrijd;
  const page = await (
    await fetch(`https://www.b-b-z.nl/kalender/?id=${id}`)
  ).text();
  const inschrijfDatumMatch = page
    .split("\n")
    .find((l) => l.includes("Inschrijfdatum:"))
    ?.match(DivRegex)!;
  const inschrijfDatum = inschrijfDatumMatch[
    inschrijfDatumMatch.length - 1
  ]!.match(CarrotRegex)![0]
    .replace(/>|</g, "")
    .match(DateRegex)![0];
  const [day, month, year] = inschrijfDatum.split("-");
  const entryDate = new Date(+year, +month - 1, +day);
  if (new Date().getTime() > entryDate.getTime()) {
    w.enterable = false;
  } else {
    w.enterable = true;
  }
  const program = page.match(/<pre>([\s\S]*?)<\/pre>/g)![0];
  console.clear();
  console.log(
    (
      await (
        await fetch("https://www.b-b-z.nl/kalender/?id=27987#programma", {
          headers: {},
        })
      ).text()
    )
      .match(
        /1\s\s100\swisselslag\sAlle\s25-99([\s\S]*?)Kaarsjesestafette/gm
      )![0]
      .split("\r")
  );
  //TODO: create better string out of fucked page
}
