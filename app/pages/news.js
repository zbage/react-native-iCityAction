/**
 * Created by ljunb on 16/5/8.
 * 新闻列表
 */
import React from 'react';
import {
    Component,
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ListView,
    RefreshControl,
} from 'react-native';

import HttpTool from '../common/Util';
import Common from '../common/Constants';
import Header from '../components/common/Header';
import CategoryMenu from '../components/menu/CategoryMenu';
import LoadingView from '../common/Loading';
import MultiImageCell from '../components/cells/MultiImageCell';
import SingleImageCell from '../components/cells/SingleImageCell';
import AdCell from '../components/cells/AdCell';
import NewsDetail from '../pages/NewsDetail';

export default class News extends Component {

    constructor(props) {
        super(props);
        
        this._renderNewsList = this._renderNewsList.bind(this);

        this.state = {
            newsCategories: null,
            isLoadedCategory: false,
            isRefreshing: true,
            currentCategory: null,
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 != row2,
            }),
        }
    }

    componentDidMount() {
        // 请求所有新闻分类名称
        this._fetchNewsCategories();
    }

    // 获取所有新闻分类
    _fetchNewsCategories() {

        HttpTool.get(Common.urls.news_categories, (response) => {

            let categories = response.item_list;
            this.setState({
                newsCategories: categories,
                isLoadedCategory: true,
                currentCategory: categories[0]
            });

            this._fetchNewsList();

        }, (error) => {
            alert('_fetchNewsCategories: ' + error)
        });
    }

    // 请求列表数据
    _fetchNewsList() {

        let category = this.state.currentCategory;

        // 拼接新闻列表URL
        let listURL = Common.urls.news_list + '?sitecode=' + category.site_code + '&poscode=' + category.pos_code + '&catcode=' + category.code + '&older_than=&newer_than=&limit=20';

        HttpTool.get(listURL, (response) => {

            let newsList = response.item_list;

            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(newsList),
                isRefreshing: false,
            })

        }, (error) => {

            alert('_fetchNewsList: ' + error)
        })
    }

    render() {
        let Content = [<Header key={100}/>];

        if (!this.state.isLoadedCategory) {
            Content.push(<LoadingView key={200}/>)
        } else {
            Content.push(
                <CategoryMenu
                    key={300}
                    categories={this.state.newsCategories}
                    fetchNewsList={(category) => {
                        this.setState({
                            currentCategory: category,
                            isRefreshing: true,
                        });
                        this._fetchNewsList();
                    }}
                />
            )

            Content.push(
                <ListView
                    key={400}
                    dataSource={this.state.dataSource}
                    renderRow={this._renderNewsList}
                    style={{height: Common.window.news_listView_height}}
                    refreshControl={
                            <RefreshControl
                                refreshing={this.state.isRefreshing}
                                onRefresh={this._fetchNewsList()}
                                title='Refresh...'
                            />
                        }
                />
            )
        }

        return (
            <View>
                {Content}
            </View>
        )
    }

    _renderNewsList(category) {

        let imageCount = category.image_count;

        if (category.type === 'news') {
            return (
                imageCount > 1 ? 
                    <MultiImageCell category={category} touchAction={this._pushToDetailPage.bind(this, category)}/>
                    : <SingleImageCell category={category} touchAction={this._pushToDetailPage.bind(this, category)}/>
            )
        }
            
        return (<AdCell category={category} touchAction={this._pushToDetailPage.bind(this, category)}/>)
    }
    
    _pushToDetailPage(category) {
        this.props.navigator.push({
            component: NewsDetail,
            passProps:{
                category: category,
            }
        })
    }
}