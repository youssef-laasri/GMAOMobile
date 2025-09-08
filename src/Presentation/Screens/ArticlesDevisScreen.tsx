import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, BackHandler } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Header from '../Components/Header'
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { ArticleDTO } from '../../Application/ApiCalls';
import { apiService } from '../../Application/Services/apiServices';
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../Infrastructure/Contexte/ArticlesContext';
import { SafeAreaView } from 'react-native-safe-area-context';


const ArticlesDevisScreen = ({ navigation }) => {

    const [title, setText] = useState('Devis');
    const [searchQuery, setSearchQuery] = useState("");
    const [displayLevel, setDisplayLevel] = useState('main'); // main, subcategory, items
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [currentItems, setCurrentItems] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [rotated, setRotated] = useState(false);
    const [DATA, setData] = useState<ArticleDTO>({});
    const { navigate } = useNavigation();
    const { Articlescart, addItem, addArticlesItems } = useCart();


    // Get main categories
    const mainCategories = Object.keys(DATA).map(key => ({
        key,
        label: key
    }));

    // const filteredData = DATA.filter(item => {
    //     const searchLower = searchText.toLowerCase();
    //     return (
    //         item.description.toLowerCase().includes(searchLower) ||
    //         item.status.toLowerCase().includes(searchLower)
    //     );
    // });




    useEffect(() => {
        const fetchDataPlanning = async () => {
            console.log(Articlescart, 'articles');
            
            if (Articlescart?.length > 0) {
                setData(Articlescart)
            }
            else {
                try {
                     console.log(Articlescart, 'articles');
                    const response = await apiService.getArticleDevis();;
                    const json = await response;
                    setData(json)
                    console.log(json, 'articles');
                    addArticlesItems(json)
                    // setLoading(false)
                } catch (err) {
                    // setError('Failed to fetch data');
                    console.error(err);
                } finally {
                    // setLoading(false);
                }
            }
        };
        fetchDataPlanning()
    }, [addArticlesItems,Articlescart])

    useEffect(() => {


        const backAction = () => {
            const { routes, index } = navigation.getState();
            const currentRoute = routes[index].name;
            if (currentRoute == "ArticlesDevisScreen" && displayLevel === "main") {
                navigation.goBack();
                return false;

            }
            else {
                handleBackPress()
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [currentItems, displayLevel, selectedSubcategory, currentItems]);


    const handleCategoryPress = (categoryKey) => {
        console.log(displayLevel, categoryKey)
        const category = DATA[categoryKey];
        setSelectedCategory(categoryKey);

        // If category has direct items, show them
        if (Array.isArray(category)) {
            setCurrentItems(category);
            setDisplayLevel("items");
            setSelectedSubcategory(null);
        }
        // If category has subcategories, show them
        else {
            const subcategories = Object.keys(category).map(key => ({
                key,
                label: key
            }));
            setCurrentItems(subcategories);
            setDisplayLevel("subcategory");
        }

    };

    const handleSubcategoryPress = (subcategoryKey) => {
        console.log(displayLevel)
        const category = DATA[selectedCategory];
        const subcategory = category[subcategoryKey];

        setSelectedSubcategory(subcategoryKey);
        setCurrentItems(subcategory);
        setDisplayLevel("items");
    };

    const handleBackPress = (article) => {
        console.log(displayLevel)
        if (displayLevel === "items" && selectedSubcategory) {
            // Go back to subcategories
            const category = DATA[selectedCategory];
            const subcategories = Object.keys(category).map(key => ({
                key,
                label: key
            }));
            setCurrentItems(subcategories);
            setDisplayLevel("subcategory");
            setSelectedSubcategory(null);

        } else {
            // Go back to main categories
            setDisplayLevel("main");
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            setCurrentItems([]);
        }
    };

    const addToList = (item) => {
        const article = {
            codeArticle: item.codeArticle,
            description: item.designation,
            quantite: 1,
            unitPrice: item.totalHt,
            total: 0
        }
        addItem(article)
        navigate(screenNames.DevisAvantTravauxScreen)

    }

    const renderItem = ({ item }) => {
        if (displayLevel === "main") {
            return (
                <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => handleCategoryPress(item.key)}
                >
                    <Text style={styles.categoryText}>{item.label}</Text>
                </TouchableOpacity>
            );
        } else if (displayLevel === "subcategory") {
            return (
                <TouchableOpacity
                    style={styles.subcategoryItem}
                    onPress={() => handleSubcategoryPress(item.key)}
                >
                    <Text style={styles.subcategoryText}>{item.label}</Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.articleItem}
                    onPress={() => addToList(item)}
                >
                    <Text style={styles.articleCode}>{item.codeArticle}</Text>
                    <Text style={styles.articleDescription}>{item.designation}</Text>
                    <Text style={styles.articlePrice}>{item.totalHt} €</Text>
                </TouchableOpacity>
            );
        }
    };




    return (
        <SafeAreaView style={styles.container}>
            <Header titleCom={title} />
            <View style={styles.searchContainer}>
                <Image style={styles.searchIcon}
                    source={require('../../../assets/Icons/search.png')} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Filtre"
                    placeholderTextColor="#666"
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>
            <View style={styles.content}>



                {/* Navigation title with back button if not on main screen */}
                {displayLevel !== "main" && (
                    <View style={styles.navigationHeader}>
                        <TouchableOpacity onPress={handleBackPress}>
                            <Text style={styles.backButton}></Text>
                        </TouchableOpacity>
                        <Text style={styles.navigationTitle}>
                            {displayLevel === "subcategory"
                                ? selectedCategory
                                : selectedSubcategory
                                    ? selectedSubcategory
                                    : selectedCategory}
                        </Text>
                        <TouchableOpacity onPress={() => console.log('')}>
                            <Text style={styles.backButton}></Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* List */}
                <FlatList style={styles.list}
                    data={displayLevel === "main" ? mainCategories : currentItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.key || item.codeArticle}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    contentContainerStyle={styles.listContent}
                />

            </View>
        </SafeAreaView >
    )
};

const styles = StyleSheet.create({
    container: {
        height: '100%'
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        // paddingVertical: 40,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 0,
        position: "absolute",
        bottom: 8,
        left: 0,
        right: 0,
        alignItems: "center",
        height: 50,
    },
    footerButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerIcon: {
        width: 35,
        height: 35,
        tintColor: '#3b5998',
    },
    footerButtonText: {
        fontSize: 16,
        marginTop: 4,
    },
    navigationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        // paddingVertical: 10,
        width: '100%'
        // backgroundColor: '#F5F5F5',
    },
    backButton: {
        fontSize: 12,
        color: '#3F51B5',
        paddingVertical: 10
        // marginRight: 10,
        // alignSelf: 'center',
        // borderWidth : 1
    },
    navigationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    listContent: {
        // flexGrow: 1,
    },
    categoryItem: {
        padding: 15,
        // backgroundColor: 'white',
    },
    categoryText: {
        fontSize: 16,
        // fontWeight: 'bold',
    },
    subcategoryItem: {
        padding: 15,
        // backgroundColor: 'white',
    },
    subcategoryText: {
        fontSize: 16,
    },
    articleItem: {
        padding: 10,
        // backgroundColor: 'white',
    },
    articleCode: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 1,
    },
    articleDescription: {
        fontSize: 14,
        marginBottom: 1,
    },
    articlePrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3F51B5',
    },
    list: {
        width: '100%'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: '#333'
    },
})




export default ArticlesDevisScreen;