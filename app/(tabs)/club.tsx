import ButtonComponent from "@/components/Button";
import Page from "@/components/Page";
import {
  enterMeet,
  getClubRecords,
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
import { Clubrecord, Wedstrijd } from "@/constants/types";
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

export default function Club() {
  const [schema, setSchema] = useState("");
  const [wedstrijden, setWedstrijden] = useState([] as Wedstrijd[]);
  const [clubrecords, setClubrecords] = useState(
    {} as { male: Clubrecord[]; female: Clubrecord[] }
  );

  useEffect(() => {
    const getS = async () => {
      const schema = await getSchemaData();
      setSchema(schema);
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
    const getC = async () => {
      const clubrecords = await getClubRecords();
      setClubrecords(clubrecords);
    };
    getS();
    getW();
    getC();
  }, []);

  const colorScheme = useColorScheme();

  return (
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
    </Page>
  );
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
  const [programLoading, setProgramLoading] = useState(false);
  const [chosenProgram, setChosenProgram] = useState([] as number[]);
  const [inschrijfLoading, setInschrijfLoading] = useState(false);

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
      <Fragment>
        <Modal
          visible={modalShown}
          // transparent={false}
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
                    // justifyContent: "space-around",
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
                    // justifyContent: "space-around",
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
                  data={selectedWedstrijd.program}
                  style={{
                    height: 600,
                    width: Dimensions.get("window").width,
                    marginTop: 0,
                  }}
                  renderItem={({ item }) => (
                    <Pressable
                      style={{
                        backgroundColor: !chosenProgram.includes(
                          parseInt(item.name.split(/\s/)[0])
                        )
                          ? "#2a3137"
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
                        const programNumber = parseInt(
                          item.name.split(/\s/)[0]
                        );
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
                            ? "#2a3137"
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
                        backgroundColor: "#2a3137",

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
              <View style={{ height: 20 }} />
              {selectedWedstrijd.enterable && (
                <ButtonComponent
                  onPress={async () => {
                    setInschrijfLoading(true);
                    await enterMeet(selectedWedstrijd, chosenProgram);
                    setInschrijfLoading(false);
                    setModalShown(false);
                  }}
                >
                  <Text style={textColor(colorScheme === "dark")}>
                    Schrijf in
                  </Text>
                </ButtonComponent>
              )}
              {inschrijfLoading && <ActivityIndicator color="#ef8b22" />}
              <ButtonComponent
                onPress={() => {
                  setModalShown(false);
                  setChosenProgram([]);
                }}
              >
                <Text style={textColor(colorScheme === "dark")}>Sluit</Text>
              </ButtonComponent>
              <View style={{ height: 20 }} />
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
          </Animated.View>
        </Pressable>
      </Fragment>
    );
  } else return <ActivityIndicator color="#ef8b22" />;
}

function ClubrecordsComponent({
  clubrecords,
  colorScheme,
}: {
  clubrecords: { male: Clubrecord[]; female: Clubrecord[] };
  colorScheme: ColorSchemeName;
}) {
  return (
    <SectionComponent title="clubrecords">
      <FlatList
        data={clubrecords.male}
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
            }}
          >
            <Text style={textColor(colorScheme)}>
              {item.distance} {item.event}
            </Text>
          </Pressable>
        )}
      />
    </SectionComponent>
  );
}
