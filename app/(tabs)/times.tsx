import ButtonComponent from "@/components/ButtonComponent";
import CheckBox from "@/components/Checkbox";
import Dropdown from "@/components/Dropdown";
import Page from "@/components/Page";
import PbTable from "@/components/PbTable";
import SectionComponent from "@/components/SectionComponent";
import SwipeModal from "@/components/SwipeModal";
import TextInputComponent from "@/components/TextInputComponent";
import { Colors, Profile, SwimrakingEventId, Time } from "@/constants/enums";
import {
  calculateAveragePoints,
  convertTimeNumberToString,
  convertTimestringToNumber,
  filterFastestFromArray,
  formatDate,
  getFastestFromArray,
  getSpecialityDataFromTimes,
  isFastestFromYear,
  textColor,
} from "@/constants/functions";
import TeamBBZSQLite from "@/constants/TeamBBZSQLite";
import { Entypo, MaterialIcons, Octicons } from "@expo/vector-icons";
import { SQLiteStatement } from "expo-sqlite";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { getDocumentAsync } from "expo-document-picker";
import { File } from "expo-file-system";
import RadarChart from "@/components/RadarChart";
import LineChart from "@/components/LineChart";
import { DateRegexes } from "@/constants/regex";
import AbsoluteDropdown from "@/components/AbsoluteDropdown";
import { useFocusEffect } from "expo-router";

export default function Times() {
  const [profile, setProfile] = useState<Profile | null>({} as Profile);
  const [swimmerSelected, setSwimmerSelected] = useState("");
  const [timesInputted, setTimesInputted] = useState(false);
  const colorScheme = useColorScheme();
  const [inputTimeModalVisible, setInputTimeModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(
    !timesInputted ? Tabs.Input : Tabs.Pbs,
  );
  const [insertTimeStatement, setInsertTimeStatement] =
    useState<SQLiteStatement | null>(null);
  const [times, setTimes] = useState<Time[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [profileInput, setProfileInput] = useState<Profile>({} as Profile);
  const [usePointGraph, setUsePointGraph] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({
    event: "25m Vrije Slag",
    poolSize: "25m",
  });

  useFocusEffect(
    useCallback(() => {
      const asyncer = async () => {
        const pr = await TeamBBZSQLite.db.getFirstAsync<Profile>(
          "SELECT * FROM profile",
        );
        const tms = await TeamBBZSQLite.sql<Time>`SELECT * FROM times`;
        setTimes(tms);

        setProfile(pr);
        setSwimmerSelected(pr?.username ?? "");
        setTimesInputted(
          !!(await TeamBBZSQLite.db.getFirstAsync<Time>("SELECT * FROM times")),
        );
      };
      asyncer();
    }, []),
  );

  if (profile) {
    return (
      <Page>
        <InputTimesModal
          onClose={() => setInputTimeModalVisible(false)}
          visible={inputTimeModalVisible}
          currentSwimmer={profile.username}
          insertTimesStatement={insertTimeStatement}
        />
        <TimesHeader
          profile={profile}
          timesInputted={timesInputted}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          swimmerSelected={swimmerSelected}
          setSwimmerSelected={setSwimmerSelected}
        />
        {activeTab === Tabs.Input && (
          <Fragment>
            <ButtonComponent
              onPress={async () => {
                setInputTimeModalVisible(true);
                setInsertTimeStatement(
                  await TeamBBZSQLite.db.prepareAsync(
                    "INSERT INTO times (event, time, poolSize, points, date, meet, location, swimmer) VALUES ($event, $time, $poolSize, $points, $date, $meet, $location, $swimmer)",
                  ),
                );
              }}
              style={{ width: "95%", paddingVertical: 10, marginVertical: 10 }}
            >
              <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                Voer tijden in
              </Text>
            </ButtonComponent>
            <ButtonComponent
              style={{ paddingVertical: 10, width: "95%" }}
              onPress={async () => {
                setUploadLoading(true);
                try {
                  const result = await getDocumentAsync({
                    copyToCacheDirectory: true,
                  });
                  if (result.canceled) return setUploadLoading(false);
                  const uri = result.assets[0].uri;
                  const file = new File(uri);
                  if (
                    !result.assets[0].name.match(
                      /Persoonlijke_Records([\s\S]*?).json/gm,
                    )?.[0] &&
                    !result.assets[0].name.match(
                      /Geschiedenis_([\s\S]*?).json/gm,
                    )
                  )
                    return console.log("KANKER"); // TODO: Show error to user
                  const fileText = file.textSync();
                  const recievedTimes = JSON.parse(fileText) as Time[];
                  const statement = await TeamBBZSQLite.db.prepareAsync(
                    "INSERT INTO times (event, time, poolSize, points, date, meet, location, swimmer) VALUES ($event, $time, $poolSize, $points, $date, $meet, $location, $swimmer)",
                  );
                  try {
                    // TODO: Update time if new information about it
                    for (const time of recievedTimes) {
                      if (
                        times.find(
                          (t) =>
                            t.event === time.event &&
                            t.poolSize === time.poolSize &&
                            t.time === time.time &&
                            t.date === time.date &&
                            t.swimmer === time.swimmer,
                        )
                      )
                        continue;
                      await statement.executeAsync({
                        $event: time.event,
                        $time: time.time,
                        $poolSize: time.poolSize,
                        $points: time.points ?? 0,
                        $date: time.date,
                        $meet: time.meet,
                        $location: time.location,
                        $swimmer: time.swimmer,
                      } as any);
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    await statement.finalizeAsync();
                    const ts =
                      await TeamBBZSQLite.sql<Time>`SELECT * FROM times`;
                    setTimes(ts);
                    setUploadLoading(false);
                    setTimesInputted(ts.length > 0);
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                Upload tijden
              </Text>
              {uploadLoading && <ActivityIndicator color={Colors.Orange} />}
            </ButtonComponent>
            {!timesInputted && (
              <Text
                style={{
                  color: "grey",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                Je moet ten minste 1 tijd invullen om verder te kunnen gaan!
              </Text>
            )}
          </Fragment>
        )}
        {activeTab === Tabs.Pbs && (
          <TimeTable
            times={times.filter((time) => time.swimmer === swimmerSelected)}
            swimmerSelected={swimmerSelected}
            profile={profile}
          />
        )}
        {activeTab === Tabs.Speciality && (
          <ScrollView
            contentContainerStyle={{
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              marginTop: 150,
            }}
            nestedScrollEnabled
          >
            <RadarChart
              size={300}
              axes={["Vlinder", "Rug", "School", "Vrij", "Wissel"]}
              rings={4}
              fillColor={
                swimmerSelected === profile.username
                  ? colorScheme === "light"
                    ? Colors.TransparantLightOrange
                    : Colors.TransparantDarkOrange
                  : undefined
              }
              strokeColor={
                swimmerSelected === profile.username
                  ? Colors.Orange
                  : Colors.Blue
              }
              data={getSpecialityDataFromTimes(
                times.filter((time) => time.swimmer === swimmerSelected),
              )}
            />
            <Text style={[textColor(colorScheme), { fontStyle: "italic" }]}>
              Gemiddeld aantal punten:{" "}
              {(
                times
                  .filter(
                    (time) =>
                      time.swimmer === swimmerSelected && time.points > 0,
                  )
                  .filter(filterFastestFromArray)
                  .reduce((acc, current) => acc + current.points, 0) /
                times
                  .filter(
                    (time) =>
                      time.swimmer === swimmerSelected && time.points > 0,
                  )
                  .filter(filterFastestFromArray).length
              ).toFixed(2)}
            </Text>
            <View
              style={{
                width: "90%",
                height: 5,
                backgroundColor: "grey",
                borderRadius: 10,
                marginTop: 5,
                marginBottom: -10,
              }}
            />
            <LineChart
              data={times
                .filter(
                  (time) =>
                    time.swimmer === swimmerSelected &&
                    time.event === selectedEvent.event &&
                    time.poolSize === selectedEvent.poolSize,
                )
                .filter(isFastestFromYear)
                .sort(
                  (a, b) =>
                    parseInt(
                      a.date?.match(DateRegexes.Number4Regex)?.[0] ?? "0",
                    ) -
                    parseInt(
                      b.date?.match(DateRegexes.Number4Regex)?.[0] ?? "0",
                    ),
                )
                .map((time, _, arr) =>
                  usePointGraph
                    ? time.points
                    : getFastestFromArray(arr).time -
                      convertTimestringToNumber(time.time),
                )}
              labels={times
                .filter(
                  (time) =>
                    time.swimmer === swimmerSelected &&
                    time.event === selectedEvent.event &&
                    time.poolSize === selectedEvent.poolSize,
                )
                .filter(isFastestFromYear)
                .sort(
                  (a, b) =>
                    parseInt(
                      a.date?.match(DateRegexes.Number4Regex)?.[0] ?? "0",
                    ) -
                    parseInt(
                      b.date?.match(DateRegexes.Number4Regex)?.[0] ?? "0",
                    ),
                )
                .map(
                  ({ date }) =>
                    date?.match(DateRegexes.Number4Regex)![0] ?? "0000",
                )}
              size={{ width: Dimensions.get("window").width, height: 300 }}
              lineColor={
                swimmerSelected === profile.username
                  ? colorScheme === "light"
                    ? "rgba(162,94,23,0.5)"
                    : "rgba(162, 94, 23, 0.8)"
                  : undefined
              }
              pointColor={
                swimmerSelected === profile.username
                  ? Colors.Orange
                  : Colors.Blue
              }
              displayDataLabels={(labelBefore) =>
                usePointGraph
                  ? labelBefore
                  : convertTimeNumberToString(
                      getFastestFromArray(
                        times.filter(
                          (time) =>
                            time.swimmer === swimmerSelected &&
                            time.event === selectedEvent.event &&
                            time.poolSize === selectedEvent.poolSize,
                        ),
                      ).time - convertTimestringToNumber(labelBefore),
                    )
              }
            />
            <View style={{}} collapsable={false}>
              <Dropdown
                data={times
                  .filter(({ swimmer }) => swimmer === swimmerSelected)
                  .map(
                    ({ event, poolSize }) =>
                      `${event} ${poolSize === "25m" ? "SC" : "LC"}`,
                  )
                  .filter((e) => !e.includes("Lap"))
                  .filter(
                    (event, index, array) => array.indexOf(event) === index,
                  )}
                onPress={(item) => {
                  const poolSize = item.includes("LC") ? "50m" : "25m";
                  setSelectedEvent({
                    event: item.replace(/\sLC|\sSC/gm, ""),
                    poolSize,
                  });
                }}
                renderItem={({ item, index }) => {
                  return (
                    <View
                      key={index}
                      style={{
                        borderWidth: 1,
                        borderColor: "grey",
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        margin: 5,
                        borderRadius: 6,
                        backgroundColor:
                          colorScheme === "dark"
                            ? Colors.DarkBackground
                            : "#fff",
                      }}
                    >
                      <Text style={[textColor(colorScheme)]}>{item}</Text>
                    </View>
                  );
                }}
                dropdownStyle={{
                  backgroundColor:
                    colorScheme === "dark" ? Colors.DarkBackground : "#fff",
                }}
                maxHeight={200}
              />
            </View>
            <View
              style={{
                paddingTop: 10,
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              <Text style={[textColor(colorScheme)]}>
                Gebruik World Aquatics punten
              </Text>
              <CheckBox
                onPress={() => setUsePointGraph(!usePointGraph)}
                checked={usePointGraph}
              />
            </View>
            <View style={{ height: 500 }} />
          </ScrollView>
        )}
      </Page>
    );
  } else
    return (
      <Page>
        <TextInputComponent
          onChangeText={(input) =>
            setProfileInput({ ...profileInput, username: input })
          }
          placeholder="Naam"
          style={{ marginBottom: 10 }}
          placeholderTextColor={"grey"}
        />
        <TextInputComponent
          onChangeText={(input) =>
            setProfileInput({ ...profileInput, email: input })
          }
          placeholder="Email"
          style={{ marginBottom: 10 }}
          autoComplete="email"
          placeholderTextColor={"grey"}
        />
        <TextInputComponent
          onChangeText={(input) =>
            setProfileInput({ ...profileInput, birthdate: input })
          }
          placeholder="Geboortedatum"
          keyboardType="numeric"
          style={{ marginBottom: 10 }}
          placeholderTextColor={"grey"}
        />
        <TextInputComponent
          onChangeText={(input) =>
            setProfileInput({ ...profileInput, club: input })
          }
          placeholder="Zwemclub"
          style={{ marginBottom: 10 }}
          placeholderTextColor={"grey"}
        />
        <TextInputComponent
          onChangeText={(input) =>
            setProfileInput({ ...profileInput, country: input })
          }
          placeholder="Land van herkomst"
          style={{ marginBottom: 10 }}
          placeholderTextColor={"grey"}
        />
        <ButtonComponent
          onPress={async () => {
            await TeamBBZSQLite.sql`INSERT INTO profile (username, email, birthdate, club, country) VALUES (${profileInput.username.trim()}, ${profileInput.email.trim()}, ${profileInput.birthdate.trim()}, ${profileInput.club.trim()}, ${profileInput.country.trim()})`;
            const pr = await TeamBBZSQLite.db.getFirstAsync<Profile>(
              "SELECT * FROM profile",
            );
            setProfile(pr);
            setSwimmerSelected(pr?.username ?? "");
          }}
          style={{ paddingVertical: 10, width: "95%" }}
        >
          <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
            Verstuur
          </Text>
        </ButtonComponent>
      </Page>
    );
}

function TimeTable({
  times,
  swimmerSelected,
  profile,
}: {
  times: Time[];
  swimmerSelected: string;
  profile: Profile;
}) {
  const strokes = {
    vlinderslag: times.filter(({ event }) =>
      event.toLocaleLowerCase().includes("vlinderslag"),
    ),
    rugslag: times.filter(({ event }) =>
      event.toLowerCase().includes("rugslag"),
    ),
    schoolslag: times.filter(({ event }) =>
      event.toLowerCase().includes("schoolslag"),
    ),
    "vrije slag": times.filter(({ event }) =>
      event.toLowerCase().includes("vrije slag"),
    ),
    wisselslag: times.filter(({ event }) =>
      event.toLowerCase().includes("wisselslag"),
    ),
  };

  const colorScheme = useColorScheme();
  const [overviewShown, setOverviewShown] = useState<Time | null>(null);
  const [historyShown, setHistoryShown] = useState<Time | null>(null);

  return (
    <Fragment>
      <SwipeModal
        visible={overviewShown !== null}
        onClose={() => setOverviewShown(null)}
        height={300}
        containerStyle={{
          borderColor:
            swimmerSelected === profile.username ? Colors.Orange : Colors.Blue,
        }}
        buttonStyle={{
          borderColor:
            swimmerSelected === profile.username ? Colors.Orange : Colors.Blue,
        }}
      >
        <View
          style={{
            width: "100%",
            flex: 1,
            padding: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={[
                textColor(colorScheme),
                { textAlign: "left", fontWeight: "bold" },
              ]}
            >
              {overviewShown?.event}{" "}
              {overviewShown?.poolSize === "25m" ? "SC" : "LC"}
            </Text>
            <Text
              style={[
                textColor(colorScheme),
                { textAlign: "right", fontWeight: "bold" },
              ]}
            >
              {overviewShown?.time}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={[textColor(colorScheme), { textAlign: "left" }]}>
              {overviewShown?.date}
            </Text>
            <Text style={[textColor(colorScheme), { textAlign: "right" }]}>
              {overviewShown?.points} Fina Punten
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={[textColor(colorScheme), { textAlign: "left" }]}>
              {overviewShown?.meet}
            </Text>
            <Text style={[textColor(colorScheme), { textAlign: "right" }]}>
              {overviewShown?.location}
            </Text>
          </View>
          <ButtonComponent
            onPress={() => {
              setOverviewShown(null);
              setHistoryShown(overviewShown);
            }}
            style={{
              backgroundColor:
                colorScheme === "dark"
                  ? Colors.ModalDarkBackground
                  : Colors.ModalLightBackground,
              paddingVertical: 10,
              borderColor:
                swimmerSelected === profile.username
                  ? Colors.Orange
                  : Colors.Blue,
            }}
          >
            <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
              Bekijk Geschiedenis
            </Text>
          </ButtonComponent>
        </View>
      </SwipeModal>
      <SwipeModal
        visible={historyShown !== null}
        onClose={() => setHistoryShown(null)}
        height={Dimensions.get("window").height * 0.9}
        containerStyle={{
          borderColor:
            swimmerSelected === profile.username ? Colors.Orange : Colors.Blue,
        }}
        buttonStyle={{
          borderColor:
            swimmerSelected === profile.username ? Colors.Orange : Colors.Blue,
        }}
      >
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text
            style={[
              textColor(colorScheme),
              {
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 20,
                zIndex: 1,
                width: Dimensions.get("window").width,
              },
            ]}
          >
            {historyShown?.event} - {historyShown?.time} -{" "}
            {historyShown?.poolSize === "25m" ? "SC" : "LC"}
          </Text>
          <FlatList
            data={times.filter(
              ({ event, poolSize }) =>
                event === historyShown?.event &&
                poolSize === historyShown.poolSize,
            )}
            style={{ marginBottom: 50 }}
            contentContainerStyle={{
              // flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            nestedScrollEnabled
            renderItem={({ item, index }) => (
              <View
                key={index}
                style={{
                  borderWidth: 1,
                  borderColor: "grey",
                  paddingVertical: 15,
                  flexDirection: "row",
                  alignContent: "space-between",
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  marginVertical: 10,
                  width: "95%",
                }}
              >
                <Text style={[textColor(colorScheme), { flex: 0.75 }]}>
                  {item?.time}
                </Text>
                <Text
                  style={[
                    textColor(colorScheme),
                    { flex: 1, textAlign: "center" },
                  ]}
                >
                  {item?.points} punten
                </Text>
                <Text
                  style={[
                    textColor(colorScheme),
                    { flex: 1, textAlign: "center" },
                  ]}
                >
                  {item?.date}
                </Text>
                <Text
                  style={[
                    textColor(colorScheme),
                    { flex: 1, textAlign: "right" },
                  ]}
                >
                  {item?.location}
                </Text>
              </View>
            )}
          />
        </View>
      </SwipeModal>
      <View
        style={{
          minHeight: "83%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 120,
        }}
      >
        {Object.keys(strokes).map((stroke) => (
          <SectionComponent
            title={stroke.charAt(0).toUpperCase() + stroke.slice(1)}
            bold
            containerStyle={{
              borderColor:
                swimmerSelected === profile.username
                  ? Colors.Orange
                  : Colors.Blue,
            }}
            key={stroke}
          >
            <FlatList
              data={strokes[stroke as keyof typeof strokes].filter(
                filterFastestFromArray,
              )}
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
                  onPress={() => setOverviewShown(item)}
                >
                  <Text
                    style={[
                      textColor(colorScheme),
                      { flex: 1, textAlign: "left" },
                    ]}
                  >
                    {item.event}
                  </Text>
                  <Text
                    style={[
                      textColor(colorScheme),
                      { flex: 1, textAlign: "center" },
                    ]}
                  >
                    {item.time}
                  </Text>
                  <Text
                    style={[
                      textColor(colorScheme),
                      { flex: 1, textAlign: "right" },
                    ]}
                  >
                    {item.poolSize}
                  </Text>
                </Pressable>
              )}
            />
          </SectionComponent>
        ))}
      </View>
    </Fragment>
  );
}

function InputTimesModal({
  visible,
  onClose,
  currentSwimmer,
  insertTimesStatement,
}: {
  visible: boolean;
  onClose: () => void;
  currentSwimmer: string;
  insertTimesStatement: SQLiteStatement | null;
}) {
  const colorScheme = useColorScheme();
  const [selectedStroke, setSelectedStroke] = useState<
    "Vlinderslag" | "Rugslag" | "Schoolslag" | "Vrije Slag" | "Wisselslag"
  >("Vlinderslag");
  const [distance, setDistance] = useState<
    25 | 50 | 100 | 200 | 300 | 400 | 800 | 1500 | 2000
  >(25);
  const [timeObject, setTimeObject] = useState<Time>({
    poolSize: "25m",
    swimmer: currentSwimmer,
  } as Time);
  const [time, setTime] = useState<{ m: number; s: number; h: number }>({
    m: 0,
    s: 0,
    h: 0,
  });
  return (
    <SwipeModal
      visible={visible}
      onClose={async () => {
        await insertTimesStatement?.finalizeAsync();
        onClose();
        setSelectedStroke("Vlinderslag");
      }}
      height={Dimensions.get("window").height * 0.72}
    >
      <ScrollView>
        <Text
          style={[
            textColor(colorScheme),
            {
              fontSize: 25,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 10,
            },
          ]}
        >
          Voer Tijd informatie in
        </Text>
        <View
          style={{
            justifyContent: "space-evenly",
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <AbsoluteDropdown
            data={
              selectedStroke === "Vrije Slag"
                ? [
                    "25m",
                    "50m",
                    "100m",
                    "200m",
                    "400m",
                    "800m",
                    "1500m",
                    "2000m",
                  ]
                : selectedStroke === "Wisselslag"
                  ? ["100m", "200m", "300m", "400m"]
                  : ["25m", "50m", "100m", "200m"]
            }
            renderItem={({ item }) => (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "grey",
                  borderRadius: 6,
                  padding: 5,
                  marginVertical: 5,
                }}
              >
                <Text style={[textColor(colorScheme)]}>{item}</Text>
              </View>
            )}
            style={{ width: "35%" }}
            textStyle={{ width: "70%" }}
            closeWhenSelected
            onPress={(item) =>
              setDistance(
                parseInt(item) as
                  | 50
                  | 100
                  | 200
                  | 300
                  | 400
                  | 800
                  | 1500
                  | 2000,
              )
            }
          />
          <AbsoluteDropdown
            data={[
              "Vlinderslag",
              "Rugslag",
              "Schoolslag",
              "Vrije Slag",
              "Wisselslag",
            ]}
            renderItem={({ item }) => (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "grey",
                  borderRadius: 6,
                  padding: 5,
                  marginVertical: 5,
                }}
              >
                <Text style={[textColor(colorScheme)]}>{item}</Text>
              </View>
            )}
            style={{ width: "45%" }}
            textStyle={{ width: "82%" }}
            onPress={(item) =>
              setSelectedStroke(
                item as
                  | "Vlinderslag"
                  | "Rugslag"
                  | "Schoolslag"
                  | "Vrije Slag"
                  | "Wisselslag",
              )
            }
            closeWhenSelected
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            marginVertical: 10,
            alignItems: "center",
            paddingHorizontal: 40,
            marginHorizontal: -30,
          }}
        >
          <Text style={[textColor(colorScheme)]}>Tijd</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "flex-end",
              gap: 10,
            }}
          >
            <TextInputComponent
              placeholder="m"
              keyboardType="numeric"
              style={{ width: 50, textAlign: "center" }}
              onChangeText={(input) => setTime({ ...time, m: parseInt(input) })}
              placeholderTextColor="#808080"
            />
            <Text
              style={[
                textColor(colorScheme),
                { fontSize: 35, fontWeight: "bold" },
              ]}
            >
              :
            </Text>
            <TextInputComponent
              placeholder="s"
              keyboardType="numeric"
              style={{ width: 50, textAlign: "center" }}
              onChangeText={(input) => setTime({ ...time, s: parseInt(input) })}
              placeholderTextColor="#808080"
            />
            <Text
              style={[
                textColor(colorScheme),
                { fontSize: 35, fontWeight: "bold" },
              ]}
            >
              .
            </Text>
            <TextInputComponent
              placeholder="h"
              keyboardType="numeric"
              style={{ width: 50, textAlign: "center" }}
              onChangeText={(input) => setTime({ ...time, h: parseInt(input) })}
              placeholderTextColor="#808080"
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            marginBottom: 10,
            marginHorizontal: -75,
          }}
        >
          <Text style={[textColor(colorScheme)]}>Kort bad (25m)</Text>
          <CheckBox
            onPress={() =>
              setTimeObject({
                ...timeObject,
                poolSize: timeObject.poolSize === "25m" ? "50m" : "25m",
              })
            }
            checked={timeObject.poolSize === "25m"}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            marginBottom: 10,
            marginHorizontal: -75,
          }}
        >
          <Text style={[textColor(colorScheme)]}>FINA Punten</Text>
          <TextInputComponent
            keyboardType="numeric"
            style={{ width: 50, textAlign: "center" }}
            onChangeText={(input) =>
              setTimeObject({ ...timeObject, points: parseInt(input) })
            }
            placeholderTextColor="#808080"
          />
        </View>
        <View
          style={{
            alignItems: "center",
            marginBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 25,
          }}
        >
          <Text style={[textColor(colorScheme)]}>Zwemmer</Text>
          <TextInputComponent
            placeholder="Zwemmer"
            style={{ width: 150, textAlign: "center" }}
            value={currentSwimmer}
            onChangeText={(input) =>
              setTimeObject({ ...timeObject, swimmer: input })
            }
            placeholderTextColor="#808080"
          />
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TextInputComponent
            placeholder="Datum (dd-mm-yyyy)"
            style={{ width: 250, textAlign: "center" }}
            keyboardType="numeric"
            onChangeText={(input) =>
              setTimeObject({ ...timeObject, date: input })
            }
            placeholderTextColor="#808080"
          />
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TextInputComponent
            placeholder="Wedstrijd"
            style={{ width: 250, textAlign: "center" }}
            onChangeText={(input) =>
              setTimeObject({ ...timeObject, meet: input })
            }
            placeholderTextColor="#808080"
          />
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TextInputComponent
            placeholder="Locatie"
            style={{ width: 250, textAlign: "center" }}
            onChangeText={(input) =>
              setTimeObject({ ...timeObject, location: input })
            }
            placeholderTextColor="#808080"
          />
        </View>
        <ButtonComponent
          onPress={async () => {
            if (
              !timeObject.points ||
              !timeObject.poolSize ||
              (!timeObject.swimmer && !currentSwimmer) ||
              !time.h ||
              !time.s ||
              !insertTimesStatement
            )
              return console.log(
                !timeObject.points,
                !timeObject.poolSize,
                !timeObject.swimmer && !currentSwimmer,
                !time.h,
                !time.s,
                !insertTimesStatement,
              );

            try {
              await insertTimesStatement.executeAsync({
                $event: `${distance}m ${selectedStroke}`,
                $time: `${String(time.m || 0).padStart(2, "0")}:${String(time.s).padStart(2, "0")}.${String(time.h).padStart(2, "0")}`,
                $poolSize: timeObject.poolSize,
                $points: timeObject.points,
                $date: timeObject.date,
                $meet: timeObject.meet,
                $location: timeObject.location,
                $swimmer: timeObject.swimmer ?? currentSwimmer,
              } as any);
            } finally {
              await insertTimesStatement.finalizeAsync();
              onClose();
            }
          }}
          style={{
            backgroundColor:
              colorScheme === "dark"
                ? Colors.ModalDarkBackground
                : Colors.ModalLightBackground,
            paddingVertical: 10,
            marginHorizontal: 20,
          }}
        >
          <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
            Voer in
          </Text>
        </ButtonComponent>
      </ScrollView>
    </SwipeModal>
  );
}

enum Tabs {
  Input = 1,
  Pbs = 2,
  Records = 3,
  Meets = 4,
  Biografy = 5,
  Speciality = 6,
}

function TimesHeader({
  profile,
  timesInputted,
  activeTab,
  setActiveTab,
  setSwimmerSelected,
  swimmerSelected,
}: {
  profile: Profile;
  timesInputted: boolean;
  activeTab: Tabs;
  setActiveTab: React.Dispatch<React.SetStateAction<Tabs>>;
  swimmerSelected: string;
  setSwimmerSelected: React.Dispatch<React.SetStateAction<string>>;
}) {
  const colorScheme = useColorScheme();
  const mainSwimmerSelected = profile.username === swimmerSelected;

  useEffect(() => {
    setActiveTab(!timesInputted ? Tabs.Input : Tabs.Pbs);
  }, [timesInputted]);
  return (
    <View
      style={{
        backgroundColor:
          colorScheme === "light" ? "#fff" : Colors.DarkBackground,
        zIndex: 2,
        height: 130,
        position: "absolute",
        top: 0,
      }}
    >
      <Pressable
        style={{
          width: "100%",
          paddingVertical: 5,
          flexDirection: "row",
          justifyContent: "center",
        }}
        onPress={async () => {
          const secondSwimmer = (
            await TeamBBZSQLite.db.getFirstAsync<Profile>(
              "SELECT * FROM profile",
            )
          )?.secondSwimmer;
          if (!secondSwimmer) return;
          setSwimmerSelected(
            mainSwimmerSelected ? secondSwimmer : profile.username,
          );
        }}
      >
        {mainSwimmerSelected ? (
          <View
            style={{
              flexDirection: "column",
              flex: 1,
              width: "90%",
              marginVertical: 10,
              borderColor: Colors.Orange,
              borderWidth: 1,
              borderRadius: 6,
              paddingHorizontal: 20,
              paddingVertical: 5,
            }}
          >
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <Text style={[textColor(colorScheme), { textAlign: "left" }]}>
                {profile.username}
              </Text>
              <Text style={[textColor(colorScheme)]}>{profile.birthdate}</Text>
            </View>
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <Text style={[textColor(colorScheme), { textAlign: "left" }]}>
                {profile.country}
              </Text>
              <Text style={[textColor(colorScheme)]}>{profile.club}</Text>
            </View>
          </View>
        ) : (
          <Text
            style={[
              {
                flexDirection: "column",
                flex: 1,
                width: "90%",
                marginVertical: 10,
                borderColor: Colors.Blue,
                borderWidth: 1,
                borderRadius: 6,
                paddingHorizontal: 20,
                paddingVertical: 16,
                textAlign: "center",
                fontWeight: "bold",
              },
              textColor(colorScheme),
            ]}
          >
            {swimmerSelected}
          </Text>
        )}
      </Pressable>

      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderColor: "grey",
          width: Dimensions.get("window").width,
          flex: 1,
          justifyContent: "space-around",
          paddingBottom: 5,
        }}
      >
        <Fragment>
          <ButtonComponent
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: activeTab === Tabs.Input ? 2 : 1,
              borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
            }}
            onPress={() => setActiveTab(Tabs.Input)}
          >
            <MaterialIcons
              name="input"
              color={textColor(colorScheme).color}
              size={20}
            />
          </ButtonComponent>
          <ButtonComponent
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: activeTab === Tabs.Pbs ? 2 : 1,
              borderColor: !timesInputted
                ? "grey"
                : mainSwimmerSelected
                  ? Colors.Orange
                  : Colors.Blue,
            }}
            onPress={() => (!timesInputted ? null : setActiveTab(Tabs.Pbs))}
          >
            <Octicons
              name="stopwatch"
              color={!timesInputted ? "grey" : textColor(colorScheme).color}
              size={20}
            />
          </ButtonComponent>
          <ButtonComponent
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: activeTab === Tabs.Speciality ? 2 : 1,
              borderColor: !timesInputted
                ? "grey"
                : mainSwimmerSelected
                  ? Colors.Orange
                  : Colors.Blue,
            }}
            onPress={() =>
              !timesInputted ? null : setActiveTab(Tabs.Speciality)
            }
          >
            <Octicons
              name="star"
              color={!timesInputted ? "grey" : textColor(colorScheme).color}
              size={20}
            />
          </ButtonComponent>
        </Fragment>
      </View>
    </View>
  );
}
