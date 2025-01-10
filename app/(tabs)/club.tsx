import ButtonComponent from "@/components/ButtonComponent";
import Page from "@/components/Page";
import {
  enterMeet,
  getClubRecords,
  getCompetitieStand,
  getSchemaData,
  getWedstrijdData,
  textColor,
} from "@/constants/functions";
import {
  RowRegex,
  TableRegex,
  CellRegex2,
  CarrotRegex,
  IdRegex,
} from "@/constants/regex";
import { Clubrecord, CompetitieStand, Wedstrijd } from "@/constants/types";
import { FontAwesome } from "@expo/vector-icons";
import { Fragment, useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  Text,
  useColorScheme,
  Animated,
  View,
  ColorSchemeName,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import SectionComponent from "@/components/SectionComponent";
import Dropdown from "@/components/Dropdown";
import { getItem } from "@/utils/AsyncStorage";
import SwipeModal from "@/components/SwipeModal";

export default function Club() {
  const [schema, setSchema] = useState("");
  const [wedstrijden, setWedstrijden] = useState([] as Wedstrijd[]);
  const [clubrecords, setClubrecords] = useState({ male: [], female: [] } as {
    male: Clubrecord[];
    female: Clubrecord[];
  });
  const [competitieStanden, setCompetitieStanden] = useState(
    [] as CompetitieStand[]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getS = async () => {
      const schema = await getSchemaData();
      setSchema(schema);
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
      const clubrecords = await getClubRecords();
      setClubrecords(clubrecords);
      setCompetitieStanden(await getCompetitieStand());
      setLoading(false);
    };

    getS();
  }, []);

  const colorScheme = useColorScheme();

  return loading ? (
    <Page>
      <ActivityIndicator size={30} color="#ef8b22" />
    </Page>
  ) : (
    <Page>
      <SchemaComponent colorScheme={colorScheme} schema={schema} />
      <WedstrijdenComponent
        colorScheme={colorScheme}
        wedstrijden={wedstrijden}
      />
      <ClubrecordsComponent
        colorScheme={colorScheme}
        clubrecords={clubrecords}
      />
      <CompetitieStandComponent
        colorScheme={colorScheme}
        competitieStanden={competitieStanden}
      />
    </Page>
  );
}

function CompetitieStandComponent({
  colorScheme,
  competitieStanden,
}: {
  colorScheme: ColorSchemeName;
  competitieStanden: CompetitieStand[];
}) {
  const [selected, setSelected] = useState({} as CompetitieStand);

  return (
    <Fragment>
      <SwipeModal
        visible={selected.team?.length > 1}
        onClose={() => setSelected({} as CompetitieStand)}
        style={{ justifyContent: "space-between", flex: 1 }}
      >
        <View
          style={{
            padding: 20,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={[
              textColor(colorScheme),
              { flex: 1, fontWeight: "bold", textAlign: "left" },
            ]}
          >
            {selected.team}
          </Text>
          <Text
            style={[
              textColor(colorScheme),
              { flex: 1, fontWeight: "bold", textAlign: "center" },
            ]}
          >
            {selected.currentPosition}
          </Text>
          <Text
            style={[
              textColor(colorScheme),
              { flex: 1, fontWeight: "bold", textAlign: "right" },
            ]}
          >
            {selected.totalPoints}
          </Text>
        </View>
        <View
          style={{
            padding: 10,
            marginHorizontal: 20,
            borderColor: "grey",
            borderWidth: 1,
            borderRadius: 6,
          }}
        >
          <FlatList
            style={{
              maxHeight: 300,
            }}
            data={["Ronde 1", "Ronde 2", "Ronde 3", "Ronde 4", "Ronde 5"]}
            renderItem={({ item, index }) => {
              const round = Object.values(selected)[index + 2] as {
                points: string;
                position: string;
              };
              return (
                <View
                  key={index}
                  style={{
                    borderColor: "#ef8b22",
                    borderWidth: 1,
                    borderRadius: 6,
                    padding: 5,
                    marginVertical: 5,
                    flexDirection: "row",
                  }}
                >
                  <Text
                    style={[
                      textColor(colorScheme),
                      { textAlign: "left", flex: 1 },
                    ]}
                  >
                    {item}
                  </Text>
                  <Text
                    style={[
                      textColor(colorScheme),
                      { textAlign: "center", flex: 1 },
                    ]}
                  >
                    {round.position}
                  </Text>
                  <Text
                    style={[
                      textColor(colorScheme),
                      { textAlign: "right", flex: 1 },
                    ]}
                  >
                    {round.points}
                  </Text>
                </View>
              );
            }}
          />
        </View>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <ButtonComponent
            onPress={() => setSelected({} as CompetitieStand)}
            style={{
              marginBottom: 20,
              width: "90%",
              backgroundColor: colorScheme === "dark" ? "#2a3137" : "#f3f5f6",
              paddingVertical: 10,
            }}
          >
            <Text style={[textColor(colorScheme)]}>Sluit</Text>
          </ButtonComponent>
        </View>
      </SwipeModal>

      <SectionComponent title="Competitie stand">
        <FlatList
          data={competitieStanden}
          style={{ height: 350 }}
          renderItem={({ item, index }) => (
            <Pressable
              style={{
                margin: 5,
                paddingVertical: 5,
                borderColor: "grey",
                borderWidth: 1,
                borderRadius: 6,
                paddingHorizontal: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => setSelected(item)}
            >
              <Text
                style={[textColor(colorScheme), { textAlign: "left", flex: 2 }]}
              >
                {item.team}
              </Text>
              <Text
                style={[
                  textColor(colorScheme),
                  { textAlign: "center", flex: 1 },
                ]}
              >
                {item.currentPosition}
              </Text>
              <Text
                style={[
                  textColor(colorScheme),
                  { textAlign: "right", flex: 1 },
                ]}
              >
                {item.totalPoints}
              </Text>
            </Pressable>
          )}
        />
      </SectionComponent>
    </Fragment>
  );
}

function SchemaComponent({
  schema,
  colorScheme,
}: {
  schema: string;
  colorScheme: ColorSchemeName;
}) {
  const currentDate = new Date();
  const [shown, setShown] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];

  const toggleExpand = () => {
    setShown(!shown);
    Animated.timing(rotateAnim, {
      toValue: shown ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const height = 2 * (schema.split("\n").length * 15 + 45);
  return (
    <>
      <SwipeModal
        visible={shown}
        onClose={toggleExpand}
        height={height}
        closeValue={200}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <View
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Text
              style={[textColor(colorScheme), { fontSize: 15, width: "100%" }]}
            >
              {schema}
            </Text>
            <ButtonComponent
              onPress={toggleExpand}
              style={{
                width: "95%",
                paddingVertical: 10,
                backgroundColor:
                  colorScheme === "light" ? "#f3f5f6" : "#2a3137",
              }}
            >
              <Text style={[textColor(colorScheme)]}>Sluit</Text>
            </ButtonComponent>
          </View>
        </View>
      </SwipeModal>
      <Pressable
        style={{
          width: Dimensions.get("window").width * 0.95,
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
          <Text style={[textColor(colorScheme)]}>
            Schema van {currentDate.getDate()}-{currentDate.getMonth() + 1}-
            {currentDate.getFullYear()}
          </Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <FontAwesome
              name="chevron-down"
              size={15}
              color={colorScheme === "dark" ? "#fff" : "#000"}
            />
          </Animated.View>
        </View>
      </Pressable>
    </>
  );
}

function WedstrijdenComponent({
  colorScheme,
  wedstrijden,
}: {
  colorScheme: ColorSchemeName;
  wedstrijden: Wedstrijd[];
}) {
  const [modalShown, setModalShown] = useState(false);
  const [selectedWedstrijd, setSelectedWedstrijd] = useState({} as Wedstrijd);
  const [programLoading, setProgramLoading] = useState(false);
  const [chosenProgram, setChosenProgram] = useState([] as number[]);
  const [inschrijfLoading, setInschrijfLoading] = useState(false);

  return (
    <Fragment>
      <Modal
        visible={modalShown}
        onRequestClose={() => {
          setModalShown(false);
          setChosenProgram([]);
        }}
        animationType="slide"
        style={{
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height,
        }}
      >
        <View
          style={{
            flex: 1,
            paddingVertical: 25,
            backgroundColor: colorScheme === "light" ? "#FFF" : "#181c20",
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flex: 1,
                width: Dimensions.get("window").width,
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  paddingHorizontal: 20,
                }}
              >
                <Text
                  style={{
                    ...textColor(colorScheme),
                    fontWeight: "bold",
                    flex: 1.5,
                    textAlign: "left",
                  }}
                  numberOfLines={1}
                >
                  {selectedWedstrijd.name}
                </Text>
                <Text
                  style={{
                    ...textColor(colorScheme),
                    fontWeight: "bold",
                    flex: 1.5,
                    textAlign: "right",
                  }}
                >
                  {selectedWedstrijd.endDate != null
                    ? `${selectedWedstrijd.startDate.getDate()}-${selectedWedstrijd.endDate?.toLocaleDateString()}`
                    : `${selectedWedstrijd.startDate?.toLocaleDateString()}`}
                </Text>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  paddingHorizontal: 20,
                }}
              >
                <Text
                  style={{
                    ...textColor(colorScheme),
                    fontWeight: "bold",
                    flex: 1.5,
                    textAlign: "left",
                  }}
                >
                  {`${selectedWedstrijd.location} - ${selectedWedstrijd.country}`}
                </Text>
                <Text
                  style={{
                    ...textColor(colorScheme),
                    fontWeight: "bold",
                    flex: 1.5,
                    textAlign: "right",
                  }}
                >
                  {selectedWedstrijd.category}
                </Text>
              </View>
            </View>
            {selectedWedstrijd.enterable && selectedWedstrijd.program && (
              <FlatList
                data={selectedWedstrijd.program.filter(
                  (p) => !p.name.includes("pauze")
                )}
                style={{
                  height: 600,
                  width: Dimensions.get("window").width,
                  marginTop: 10,
                }}
                renderItem={({ item }) => (
                  <Pressable
                    style={{
                      backgroundColor: !chosenProgram.includes(
                        parseInt(item.name.split(/\s/)[0])
                      )
                        ? colorScheme === "dark"
                          ? "#2a3137"
                          : "#d6d6d6"
                        : "#133914",
                      margin: 10,
                      flex: 1,
                      borderRadius: 10,
                      paddingHorizontal: 5,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingVertical: 15,
                      flexDirection: "row",
                      minHeight: 10,
                      borderColor: chosenProgram.includes(
                        parseInt(item.name.split(/\s/)[0])
                      )
                        ? "#b7f1b9"
                        : "#2a3137",
                      borderWidth: 1,
                    }}
                    onPress={() => {
                      const programNumber = parseInt(item.name.split(/\s/)[0]);
                      if (chosenProgram.includes(programNumber)) {
                        setChosenProgram(
                          chosenProgram.filter((num) => num !== programNumber)
                        );
                      } else {
                        setChosenProgram([...chosenProgram, programNumber]);
                      }
                    }}
                  >
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        backgroundColor: !chosenProgram.includes(
                          parseInt(item.name.split(/\s/)[0])
                        )
                          ? colorScheme === "dark"
                            ? "#2a3137"
                            : "#fff"
                          : "#90ea93",
                        borderColor: "#fff",
                        borderWidth: 1,
                        borderRadius: 3,
                        marginHorizontal: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {chosenProgram.includes(
                        parseInt(item.name.split(/\s/)[0])
                      ) && (
                        <FontAwesome
                          name="check"
                          size={15}
                          color="#000"
                          style={{ textAlign: "center" }}
                        ></FontAwesome>
                      )}
                    </View>
                    <Text
                      style={{
                        ...textColor(colorScheme),
                        textAlign: "center",
                        flex: 1,
                      }}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                )}
              />
            )}
            {!selectedWedstrijd.enterable && selectedWedstrijd.program && (
              <FlatList
                data={selectedWedstrijd.program}
                style={{
                  height: 600,
                  width: Dimensions.get("window").width,
                  marginTop: 0,
                  borderRadius: 10,
                }}
                renderItem={({ item, index }) => (
                  <Pressable
                    key={index}
                    style={{
                      backgroundColor:
                        colorScheme === "dark" ? "#2a3137" : "#d6d6d6",
                      margin: 10,
                      flex: 1,
                      borderRadius: 10,
                      paddingHorizontal: 5,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingVertical: 15,
                      flexDirection: "row",
                      minHeight: 10,
                    }}
                    onPress={async () => {
                      if (item.no < 0) return;
                      const pdfUrl = `${selectedWedstrijd.livetimeLink}StartList_${item.no}.pdf`;
                      const docsUrl = `https://docs.google.com/gview?embedded=true&url=${pdfUrl}`;

                      await WebBrowser.openBrowserAsync(docsUrl);
                    }}
                  >
                    <Text style={textColor(colorScheme)}>{item.name}</Text>
                  </Pressable>
                )}
              />
            )}
            {selectedWedstrijd.enterable && (
              <ButtonComponent
                onPress={async () => {
                  setInschrijfLoading(true);
                  await enterMeet(selectedWedstrijd, chosenProgram);
                  setInschrijfLoading(false);
                  setModalShown(false);
                }}
                style={{
                  width: "90%",
                  marginVertical: 10,
                  paddingVertical: 5,
                }}
              >
                <Text style={textColor(colorScheme)}>Schrijf in</Text>
              </ButtonComponent>
            )}
            {inschrijfLoading && <ActivityIndicator color="#ef8b22" />}
            <ButtonComponent
              onPress={() => {
                setModalShown(false);
                setChosenProgram([]);
              }}
              style={{
                width: "90%",
                marginVertical: 10,
                paddingVertical: 5,
              }}
            >
              <Text style={textColor(colorScheme)}>Sluit</Text>
            </ButtonComponent>
            <View style={{ height: 20 }} />
          </View>
        </View>
      </Modal>
      <SectionComponent title="Wedstrijden">
        {wedstrijden.slice(0, 10).map((wedstrijd, i) => (
          <Pressable
            key={i}
            onPress={async (e) => {
              e.stopPropagation();

              setProgramLoading(true);
              setSelectedWedstrijd({ id: wedstrijd.id } as Wedstrijd);
              const w = await getWedstrijdData(wedstrijd);
              setProgramLoading(false);
              setSelectedWedstrijd(w);
              setModalShown(true);
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
            {programLoading && selectedWedstrijd.id === wedstrijd.id && (
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
      </SectionComponent>
    </Fragment>
  );
}

function ClubrecordsComponent({
  clubrecords,
  colorScheme,
}: {
  clubrecords: { male: Clubrecord[]; female: Clubrecord[] };
  colorScheme: ColorSchemeName;
}) {
  const ages = [
    "onder 8",
    "onder 10",
    "onder 12",
    "onder 14",
    "onder 16",
    "onder 18",
    "onder 20",
    "Senioren",
  ];
  const [selected, setSelected] = useState("Mannen" as "Mannen" | "Vrouwen");
  const [selectedClubrecord, setSelectedClubrecord] = useState({
    distance: "",
    times: [],
    swimmers: [],
    event: "",
    dates: [],
    locations: [],
    meets: [],
  } as Clubrecord);

  return (
    <Fragment>
      <SwipeModal
        visible={selectedClubrecord.distance.length > 0}
        onRequestClose={() =>
          setSelectedClubrecord({
            distance: "",
            times: [],
            swimmers: [],
            event: "",
            dates: [],
            locations: [],
            meets: [],
          })
        }
        onClose={() =>
          setSelectedClubrecord({
            distance: "",
            times: [],
            swimmers: [],
            event: "",
            dates: [],
            locations: [],
            meets: [],
          })
        }
        height={700}
        closeValue={200}
      >
        <View
          style={{
            padding: 20,
            flex: 1,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            <Text
              style={[
                textColor(colorScheme),
                { fontWeight: "bold", textAlign: "center", fontSize: 25 },
              ]}
            >
              {selectedClubrecord.distance} {selectedClubrecord.event}
            </Text>
            <View>
              {selectedClubrecord.times.map((time, index) => (
                <View
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: 6,
                    borderColor: "grey",
                    borderWidth: 1,
                    margin: 5,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <Text
                    style={[
                      textColor(colorScheme),
                      { textTransform: "capitalize", flex: 1 },
                    ]}
                  >
                    {ages[index]}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[textColor(colorScheme), { textAlign: "center" }]}
                    >
                      {time}
                    </Text>
                    <Text
                      style={[textColor(colorScheme), { textAlign: "center" }]}
                    >
                      {selectedClubrecord.swimmers[index]}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <ButtonComponent
              style={{
                backgroundColor: colorScheme === "dark" ? "#2a3137" : "#f3f5f6",
                paddingVertical: 10,
                marginVertical: 10,
              }}
              onPress={() =>
                setSelectedClubrecord({
                  distance: "",
                  times: [],
                  swimmers: [],
                  event: "",
                  dates: [],
                  locations: [],
                  meets: [],
                })
              }
            >
              <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                Sluit
              </Text>
            </ButtonComponent>
          </View>
        </View>
      </SwipeModal>
      <SectionComponent title="Clubrecords">
        <View
          style={{ display: "flex", alignItems: "center", marginBottom: 10 }}
        >
          <Dropdown
            style={{ borderColor: "#ef8b22" }}
            onPress={(item) => setSelected(item)}
            data={["Mannen", "Vrouwen"]}
            renderItem={({ item, index }) => (
              <Text
                style={{
                  ...textColor(colorScheme),
                  borderColor: "grey",
                  borderWidth: 1,
                  borderRadius: 6,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  marginVertical: 5,
                }}
              >
                {item}
              </Text>
            )}
          />
        </View>
        <View
          style={{
            borderColor: "#ef8b22",
            borderWidth: 1,
            padding: 10,
            borderRadius: 6,
          }}
        >
          <FlatList
            data={selected === "Mannen" ? clubrecords.male : clubrecords.female}
            style={{ height: 350 }}
            renderItem={({ item, index }) => (
              <Pressable
                key={index}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderColor: "grey",
                  borderWidth: 1,
                  borderRadius: 6,
                  marginVertical: 5,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
                onPress={() => setSelectedClubrecord(item)}
              >
                <Text
                  style={{
                    ...textColor(colorScheme),
                    width: "25%",
                    textAlign: "left",
                  }}
                >
                  {item.distance} {item.event}
                </Text>
                <Text
                  style={{
                    ...textColor(colorScheme),
                    width: "35%",
                    textAlign: "center",
                  }}
                >
                  {
                    item.times[
                      item.times.findLastIndex(
                        (swimmer) => swimmer?.length && swimmer.length > 0
                      )
                    ]
                  }
                </Text>
                <Text
                  style={{
                    ...textColor(colorScheme),
                    width: "30%",
                    textAlign: "center",
                  }}
                >
                  {
                    item.swimmers[
                      item.swimmers.findLastIndex(
                        (swimmer) => swimmer?.length && swimmer.length > 0
                      )
                    ]
                  }
                </Text>
              </Pressable>
            )}
          />
        </View>
      </SectionComponent>
    </Fragment>
  );
}
